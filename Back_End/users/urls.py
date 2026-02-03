from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # path('', views.user_list, name='user_list'),
    # path('create/', views.user_create, name='user_create'),
    # path('<int:pk>/', views.user_detail, name='user_detail'),
    # path('update/<int:pk>/', views.user_update, name='user_update'),
    # path('delete/<int:pk>/', views.user_delete, name='user_delete'),
     path('api/login/', views.LoginAPIView.as_view(), name='api_login'),
    path('api/logout/', views.LogoutAPIView.as_view(), name='api_logout'),
    path('api/current-user/', views.CurrentUserAPIView.as_view(), name='current_user'),
    path('api/check-auth/', views.CheckAuthAPIView.as_view(), name='check_auth'),
    path('api/csrf-token/', views.CSRFTokenAPIView.as_view(), name='csrf_token'),
]