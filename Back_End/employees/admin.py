# employees/admin.py
from django.contrib import admin
from .models import Employee, Notification

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'employee_id', 'get_user_name', 'get_department', 
        'position', 'employment_status', 'hire_date'
    ]
    list_filter = ['employment_status', 'hire_date']
    search_fields = ['employee_id', 'user__username', 'user__first_name', 'user__last_name', 'position']
    raw_id_fields = ['user']
    readonly_fields = ['employee_id', 'created_at', 'updated_at']
    
    def get_user_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return "-"
    get_user_name.short_description = 'Nom complet'
    get_user_name.admin_order_field = 'user__first_name'
    
    def get_department(self, obj):
        return obj.department.name if obj.department else "-"
    get_department.short_description = 'Département'
    get_department.admin_order_field = 'department__name'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    raw_id_fields = ['user']
    readonly_fields = ['created_at']