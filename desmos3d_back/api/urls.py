from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EquationViewSet, GraphConfigViewSet, default_data, 
    register_user, login_user, CustomAuthToken, test_auth_endpoint,
    list_routes
)

router = DefaultRouter()
router.register(r'equations', EquationViewSet, basename='equation')
router.register(r'graph-configs', GraphConfigViewSet, basename='graph-config')

urlpatterns = [
    path('', include(router.urls)),
    path('default-data/', default_data, name='default-data'),
    path('routes/', list_routes, name='list-routes'),  # List all routes for debugging
    
    # Auth endpoints
    path('auth/', test_auth_endpoint, name='auth-test'),  # Test endpoint
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/token/', CustomAuthToken.as_view(), name='token'),
] 