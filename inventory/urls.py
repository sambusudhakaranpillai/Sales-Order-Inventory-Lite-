from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, DealerViewSet, InventoryViewSet, OrderViewSet

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="products")
router.register(r"dealers", DealerViewSet, basename="dealers")
router.register(r"inventory", InventoryViewSet, basename="inventory")
router.register(r"orders", OrderViewSet, basename="orders")

urlpatterns = router.urls