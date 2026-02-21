# employees/urls.py
from django.urls import path
from . import views

app_name = 'employees'

urlpatterns = [
    # Employees
    path('', views.EmployeeListCreateView.as_view(), name='employee-list'),
    path('<int:pk>/', views.EmployeeDetailView.as_view(), name='employee-detail'),
    path('by-user/<int:user_id>/', views.EmployeeByUserView.as_view(), name='employee-by-user'),
    
    # Notifications
    path('notifications/', views.NotificationListCreateView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/mark-read/<int:pk>/', views.MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('notifications/mark-all-read/', views.MarkAllNotificationsReadView.as_view(), name='mark-all-notifications-read'),
    path('notifications/unread-count/', views.UnreadNotificationCountView.as_view(), name='unread-notification-count'),
    
    # Dashboard
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('recent-activities/', views.RecentActivitiesView.as_view(), name='recent-activities'),
]