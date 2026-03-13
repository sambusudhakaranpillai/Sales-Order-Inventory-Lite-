from decimal import Decimal
from rest_framework import serializers
from .models import Product, Inventory, Dealer, Order, OrderItem


class ProductSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.IntegerField(source="inventory.quantity", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "description",
            "price",
            "is_active",
            "created_at",
            "updated_at",
            "stock_quantity",
        ]


class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "id",
            "product",
            "product_name",
            "sku",
            "quantity",
            "updated_by",
            "updated_at",
        ]


class DealerOrderMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["id", "order_number", "status", "total_amount", "created_at"]


class DealerSerializer(serializers.ModelSerializer):
    orders = DealerOrderMiniSerializer(many=True, read_only=True)

    class Meta:
        model = Dealer
        fields = [
            "id",
            "name",
            "dealer_code",
            "email",
            "phone",
            "address",
            "is_active",
            "created_at",
            "orders",
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "sku",
            "quantity",
            "unit_price",
            "line_total",
        ]
        read_only_fields = ["unit_price", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    dealer_name = serializers.CharField(source="dealer.name", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "dealer",
            "dealer_name",
            "status",
            "total_amount",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = [
            "order_number",
            "status",
            "total_amount",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])

        if not items_data:
            raise serializers.ValidationError("Order must contain at least one item.")

        order = Order.objects.create(**validated_data)
        total = Decimal("0.00")

        for item_data in items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]

            if quantity <= 0:
                raise serializers.ValidationError("Item quantity must be greater than 0.")

            unit_price = product.price
            line_total = Decimal(quantity) * Decimal(unit_price)

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
            total += line_total

        order.total_amount = total
        order.save(update_fields=["total_amount"])
        return order

    def update(self, instance, validated_data):
        if instance.status != "draft":
            raise serializers.ValidationError("Only draft orders can be edited.")

        if "status" in validated_data:
            raise serializers.ValidationError(
                "Order status cannot be changed directly. Use confirm or deliver actions."
            )

        items_data = validated_data.pop("items", None)

        instance.dealer = validated_data.get("dealer", instance.dealer)
        instance.save()

        if items_data is not None:
            if not items_data:
                raise serializers.ValidationError("Order must contain at least one item.")

            instance.items.all().delete()
            total = Decimal("0.00")

            for item_data in items_data:
                product = item_data["product"]
                quantity = item_data["quantity"]

                if quantity <= 0:
                    raise serializers.ValidationError("Item quantity must be greater than 0.")

                unit_price = product.price
                line_total = Decimal(quantity) * Decimal(unit_price)

                OrderItem.objects.create(
                    order=instance,
                    product=product,
                    quantity=quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )
                total += line_total

            instance.total_amount = total
            instance.save(update_fields=["total_amount"])

        return instance