# attendance/urls.py
from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('', views.AttendanceListCreateView.as_view(), name='attendance-list'),
    path('<int:pk>/', views.AttendanceDetailView.as_view(), name='attendance-detail'),
    path('check-in/', views.CheckInView.as_view(), name='check-in'),
    path('check-out/', views.CheckOutView.as_view(), name='check-out'),
    path('today/', views.TodayAttendanceView.as_view(), name='today-attendance'),
    path('my-history/', views.MyAttendanceHistoryView.as_view(), name='my-history'),
    path('employee/<int:employee_id>/', views.EmployeeAttendanceView.as_view(), name='employee-attendance'),
    path('stats/monthly/', views.MonthlyAttendanceStatsView.as_view(), name='monthly-stats'),
    path('settings/', views.AttendanceSettingsView.as_view(), name='attendance-settings'),
]