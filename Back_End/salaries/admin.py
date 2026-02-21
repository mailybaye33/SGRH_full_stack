# salaries/admin.py
from django.contrib import admin
from .models import (
    SalaryGrade, EmployeeSalary, SalaryHistory,
    Payroll, PayrollBatch, SalaryAdvance
)

@admin.register(SalaryGrade)
class SalaryGradeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'code', 'min_salary', 'max_salary', 'mid_salary', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code', 'description']
    list_editable = ['min_salary', 'max_salary', 'is_active']


@admin.register(EmployeeSalary)
class EmployeeSalaryAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'employee', 'base_salary', 'grade', 'payment_method',
        'is_active', 'effective_date'
    ]
    list_filter = ['is_active', 'payment_method', 'grade']
    search_fields = ['employee__user__username', 'bank_account']
    raw_id_fields = ['employee', 'grade', 'created_by']
    readonly_fields = [
        'gross_salary', 'total_allowances', 'tax_amount',
        'social_security_amount', 'pension_amount',
        'total_deductions', 'net_salary', 'created_at', 'updated_at'
    ]


@admin.register(SalaryHistory)
class SalaryHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'employee', 'previous_salary', 'new_salary',
        'change_percentage', 'change_date', 'changed_by'
    ]
    list_filter = ['change_date']
    search_fields = ['employee__user__username', 'reason']
    raw_id_fields = ['employee', 'changed_by']


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'employee', 'month', 'year', 'gross_salary',
        'net_salary', 'status', 'payment_date'
    ]
    list_filter = ['status', 'month', 'year']
    search_fields = ['employee__user__username']
    date_hierarchy = 'payment_date'
    raw_id_fields = ['employee', 'validated_by', 'created_by']
    readonly_fields = ['gross_salary', 'total_deductions', 'net_salary', 'created_at', 'updated_at']


@admin.register(PayrollBatch)
class PayrollBatchAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'month', 'year', 'count', 'total_amount', 'status']
    list_filter = ['status', 'month', 'year']
    search_fields = ['name']
    raw_id_fields = ['processed_by']
    filter_horizontal = ['payrolls']


@admin.register(SalaryAdvance)
class SalaryAdvanceAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'employee', 'amount', 'request_date',
        'expected_payment_date', 'status'
    ]
    list_filter = ['status', 'request_date']
    search_fields = ['employee__user__username', 'reason']
    raw_id_fields = ['employee', 'approved_by']
    readonly_fields = ['monthly_repayment', 'created_at', 'updated_at']