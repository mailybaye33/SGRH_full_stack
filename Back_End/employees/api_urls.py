from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import EmployeeViewSet

router = DefaultRouter()
router.register(r'', EmployeeViewSet, basename='employee')

urlpatterns = [
    path('', include(router.urls)),
]