from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    ProductViewSet,
    login_view,
    stats_view,
    export_excel_view,
    transactions_view,
    create_superuser_view,
    debts_view,
    debt_detail_view,
    export_debts_excel_view,
)

# Create router
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

# Get URLs from router
urlpatterns = [
    path('', include(router.urls)),
    path('stats/', stats_view, name='stats'),
    path('export/excel/', export_excel_view, name='export_excel'),
    path('transactions/', transactions_view, name='transactions'),
    path('debts/', debts_view, name='debts'),
    path('debts/<int:pk>/', debt_detail_view, name='debt_detail'),
    path('debts/export/excel/', export_debts_excel_view, name='debts_export_excel'),
    path('auth/login/', login_view, name='login'),
    path('auth/create-superuser/', create_superuser_view, name='create_superuser'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# The stats and export/excel endpoints are now handled by the router
# They are available at:
# - GET /api/products/stats/
# - GET /api/products/export/excel/
