# leaves/admin.py
from django.contrib import admin
from .models import LeaveType, LeaveBalance, Leave, LeavePeriod, LeaveRequestHistory

@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'code', 'default_days', 'is_paid', 'is_active', 'color']
    list_filter = ['is_paid', 'is_active']
    search_fields = ['name', 'code', 'description']
    list_editable = ['default_days', 'is_paid', 'is_active']


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee', 'leave_type', 'year', 'total_days', 'used_days', 'remaining_days']
    list_filter = ['year', 'leave_type']
    search_fields = ['employee__user__username', 'employee__employee_id']
    raw_id_fields = ['employee', 'leave_type']


@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'employee', 'leave_type', 'start_date', 'end_date',
        'duration_days', 'status', 'created_at'
    ]
    list_filter = ['status', 'leave_type', 'start_date']
    search_fields = ['employee__user__username', 'reason', 'comments']
    date_hierarchy = 'start_date'
    raw_id_fields = ['employee', 'leave_type', 'approved_by', 'created_by']
    readonly_fields = ['created_at', 'updated_at', 'approved_at']


@admin.register(LeavePeriod)
class LeavePeriodAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    date_hierarchy = 'start_date'


@admin.register(LeaveRequestHistory)
class LeaveRequestHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'leave', 'user', 'action', 'created_at']
    list_filter = ['action']
    search_fields = ['leave__employee__user__username', 'comment']
    raw_id_fields = ['leave', 'user']
    readonly_fields = ['created_at']