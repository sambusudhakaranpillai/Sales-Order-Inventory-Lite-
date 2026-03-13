from django.db import transaction
from django.db.models import ProtectedError, Sum, Count
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, Inventory, Dealer, Order
from .serializers import (
    ProductSerializer,
    InventorySerializer,
    DealerSerializer,
    OrderSerializer,
)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-id")
    serializer_class = ProductSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"error": "Cannot delete this product because it is used in orders."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DealerViewSet(viewsets.ModelViewSet):
    queryset = Dealer.objects.prefetch_related("orders").all().order_by("-id")
    serializer_class = DealerSerializer
    http_method_names = ["get", "post", "put", "patch", "head", "options"]


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related("product").all().order_by("-id")
    serializer_class = InventorySerializer
    http_method_names = ["get", "post", "put", "patch", "head", "options"]

    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product")

        if not product_id:
            return Response(
                {"error": "Product is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Inventory.objects.filter(product_id=product_id).exists():
            return Response(
                {"error": "Inventory already exists for this product."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {"error": "Quantity is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except ValueError:
            return Response(
                {"error": "Quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 0:
            return Response(
                {"error": "Quantity cannot be negative."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.quantity = quantity
        instance.updated_by = str(request.user) if request.user.is_authenticated else "system"
        instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["put"], url_path=r"product/(?P<product_id>\d+)")
    def update_by_product(self, request, product_id=None):
        try:
            instance = Inventory.objects.get(product_id=product_id)
        except Inventory.DoesNotExist:
            return Response(
                {"error": "Inventory not found for this product."},
                status=status.HTTP_404_NOT_FOUND,
            )

        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {"error": "Quantity is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except ValueError:
            return Response(
                {"error": "Quantity must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 0:
            return Response(
                {"error": "Quantity cannot be negative."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.quantity = quantity
        instance.updated_by = str(request.user) if request.user.is_authenticated else "system"
        instance.save()

        return Response(self.get_serializer(instance).data)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("dealer").prefetch_related("items__product").all().order_by("-id")
    serializer_class = OrderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        status_param = self.request.query_params.get("status")
        dealer_param = self.request.query_params.get("dealer")
        date_param = self.request.query_params.get("date")

        if status_param:
            queryset = queryset.filter(status=status_param)

        if dealer_param:
            queryset = queryset.filter(dealer_id=dealer_param)

        if date_param:
            queryset = queryset.filter(created_at__date=date_param)

        return queryset

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        order = self.get_object()

        if order.status != "draft":
            return Response(
                {"error": "Only draft orders can be confirmed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not order.items.exists():
            return Response(
                {"error": "Cannot confirm an order without items."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            inventory_map = {}

            for item in order.items.select_related("product"):
                try:
                    inventory = Inventory.objects.select_for_update().get(product=item.product)
                except Inventory.DoesNotExist:
                    return Response(
                        {"error": f"Inventory does not exist for product {item.product.name}."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if inventory.quantity < item.quantity:
                    return Response(
                        {
                            "error": (
                                f"Insufficient stock for {item.product.name}. "
                                f"Available: {inventory.quantity}, Requested: {item.quantity}"
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                inventory_map[item.product.id] = inventory

            for item in order.items.select_related("product"):
                inventory = inventory_map[item.product.id]
                inventory.quantity -= item.quantity
                inventory.updated_by = str(request.user) if request.user.is_authenticated else "system"
                inventory.save()

            order.status = "confirmed"
            order.save(update_fields=["status", "updated_at"])

        return Response(
            {"message": "Order confirmed successfully."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def deliver(self, request, pk=None):
        order = self.get_object()

        if order.status != "confirmed":
            return Response(
                {"error": "Only confirmed orders can be delivered."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "delivered"
        order.save(update_fields=["status", "updated_at"])

        return Response(
            {"message": "Order delivered successfully."},
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        order = self.get_object()

        if order.status != "draft":
            return Response(
                {"error": "Only draft orders can be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)


class OrderSummaryReportView(APIView):
    def get(self, request):
        data = Order.objects.values("status").annotate(
            count=Count("id"),
            total_amount=Sum("total_amount"),
        ).order_by("status")
        return Response(data)