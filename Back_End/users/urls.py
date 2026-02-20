from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    # path('api/login/', views.LoginAPIView.as_view(), name='api_login'),
    path('api/login/', views.SimpleLoginAPIView.as_view(), name='api_login'),
    path('api/logout/', views.LogoutAPIView.as_view(), name='api_logout'),
    path('api/current-user/', views.CurrentUserAPIView.as_view(), name='current_user'),
    path('api/check-auth/', views.CheckAuthAPIView.as_view(), name='check_auth'),
    path('api/csrf-token/', views.CSRFTokenAPIView.as_view(), name='csrf_token'),
    
    path('api/test-logout/', views.TestLogoutView.as_view(), name='test_logout'),
    # User management endpoints
    path('api/users/', views.UserListCreateAPIView.as_view(), name='user_list_create'),
    path('api/users/<int:pk>/', views.UserDetailAPIView.as_view(), name='user_detail'),
]