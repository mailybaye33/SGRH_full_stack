# attendance/admin.py
from django.contrib import admin
from .models import Attendance, AttendanceSettings

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee', 'date', 'check_in', 'check_out', 'status', 'hours_worked']
    list_filter = ['status', 'date']
    search_fields = ['employee__user__username', 'employee__employee_id', 'notes']
    date_hierarchy = 'date'
    raw_id_fields = ['employee', 'created_by']
    readonly_fields = ['hours_worked', 'overtime', 'created_at', 'updated_at']

@admin.register(AttendanceSettings)
class AttendanceSettingsAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'check_in_start', 'check_in_end', 'work_hours_per_day']