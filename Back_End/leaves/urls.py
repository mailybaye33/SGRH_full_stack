# leaves/urls.py
from django.urls import path
from . import views

app_name = 'leaves'

urlpatterns = [
    # Leave Types
    path('types/', views.LeaveTypeListCreateView.as_view(), name='leave-type-list'),
    path('types/<int:pk>/', views.LeaveTypeDetailView.as_view(), name='leave-type-detail'),
    
    # Leave Balances
    path('balances/', views.LeaveBalanceListCreateView.as_view(), name='leave-balance-list'),
    path('balances/<int:pk>/', views.LeaveBalanceDetailView.as_view(), name='leave-balance-detail'),
    path('balances/employee/<int:employee_id>/', views.EmployeeLeaveBalanceView.as_view(), name='employee-leave-balance'),
    
    # Leaves (Demandes de congés) - CORRIGÉ : utilise les bonnes vues
    path('', views.LeaveListCreateView.as_view(), name='leave-list'),
    path('<int:pk>/', views.LeaveDetailView.as_view(), name='leave-detail'),
    path('<int:pk>/approve/', views.LeaveApproveView.as_view(), name='leave-approve'),
    path('employee/<int:employee_id>/', views.LeaveByEmployeeView.as_view(), name='leave-by-employee'),
    path('pending/', views.PendingLeavesView.as_view(), name='pending-leaves'),
    path('current/', views.CurrentLeavesView.as_view(), name='current-leaves'),
    path('upcoming/', views.UpcomingLeavesView.as_view(), name='upcoming-leaves'),
    path('calendar/', views.LeaveCalendarView.as_view(), name='leave-calendar'),
    path('summary/', views.LeaveSummaryView.as_view(), name='leave-summary'),
    
    # Leave Periods
    path('periods/', views.LeavePeriodListCreateView.as_view(), name='leave-period-list'),
    path('periods/<int:pk>/', views.LeavePeriodDetailView.as_view(), name='leave-period-detail'),
    
    # History
    path('<int:leave_id>/history/', views.LeaveHistoryView.as_view(), name='leave-history'),
    
    # Statistics
    path('statistics/', views.LeaveStatisticsView.as_view(), name='leave-statistics'),
]