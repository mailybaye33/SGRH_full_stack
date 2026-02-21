# salaries/urls.py
from django.urls import path
from . import views

app_name = 'salaries'

urlpatterns = [
    # Salary Grades
    path('grades/', views.SalaryGradeListCreateView.as_view(), name='salary-grade-list'),
    path('grades/<int:pk>/', views.SalaryGradeDetailView.as_view(), name='salary-grade-detail'),
    
    # Employee Salaries
    path('employee-salaries/', views.EmployeeSalaryListCreateView.as_view(), name='employee-salary-list'),
    path('employee-salaries/<int:pk>/', views.EmployeeSalaryDetailView.as_view(), name='employee-salary-detail'),
    path('employee-salaries/current/', views.CurrentEmployeeSalaryView.as_view(), name='current-employee-salary'),
    path('employee-salaries/history/<int:employee_id>/', views.EmployeeSalaryHistoryView.as_view(), name='employee-salary-history'),
    
    # Payrolls
    path('payrolls/', views.PayrollListCreateView.as_view(), name='payroll-list'),
    path('payrolls/<int:pk>/', views.PayrollDetailView.as_view(), name='payroll-detail'),
    path('payrolls/<int:pk>/validate/', views.PayrollValidateView.as_view(), name='payroll-validate'),
    path('payrolls/employee/<int:employee_id>/', views.PayrollByEmployeeView.as_view(), name='payroll-by-employee'),
    path('payrolls/my-payrolls/', views.MyPayrollsView.as_view(), name='my-payrolls'),
    path('payrolls/pending/', views.PendingPayrollsView.as_view(), name='pending-payrolls'),
    
    # Payroll Batches
    path('batches/', views.PayrollBatchListCreateView.as_view(), name='payroll-batch-list'),
    path('batches/<int:pk>/', views.PayrollBatchDetailView.as_view(), name='payroll-batch-detail'),
    path('batches/create-from-employees/', views.PayrollBatchCreateFromEmployeesView.as_view(), name='payroll-batch-create'),
    path('batches/<int:pk>/process/', views.PayrollBatchProcessView.as_view(), name='payroll-batch-process'),
    
    # Salary Advances
    path('advances/', views.SalaryAdvanceListCreateView.as_view(), name='salary-advance-list'),
    path('advances/<int:pk>/', views.SalaryAdvanceDetailView.as_view(), name='salary-advance-detail'),
    path('advances/<int:pk>/approve/', views.SalaryAdvanceApproveView.as_view(), name='salary-advance-approve'),
    path('advances/my-advances/', views.MySalaryAdvancesView.as_view(), name='my-salary-advances'),
    
    # Statistics
    path('statistics/', views.SalaryStatisticsView.as_view(), name='salary-statistics'),
    path('employee-summary/<int:employee_id>/', views.EmployeeSalarySummaryView.as_view(), name='employee-salary-summary'),
]