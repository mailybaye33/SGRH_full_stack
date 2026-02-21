# promotions/admin.py
from django.contrib import admin
from .models import PromotionType, Promotion, PromotionHistory, CareerPath

@admin.register(PromotionType)
class PromotionTypeAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'code', 'color', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code', 'description']
    list_editable = ['color', 'is_active']


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'employee', 'promotion_type', 'old_position', 'new_position',
        'promotion_date', 'salary_increase', 'status'
    ]
    list_filter = ['status', 'promotion_type', 'promotion_date']
    search_fields = [
        'employee__user__username', 'employee__user__first_name',
        'old_position', 'new_position', 'reason'
    ]
    date_hierarchy = 'promotion_date'
    raw_id_fields = ['employee', 'promotion_type', 'old_department', 'new_department', 'approved_by', 'created_by']
    readonly_fields = ['salary_increase', 'salary_increase_percentage', 'created_at', 'updated_at', 'approved_at']


@admin.register(PromotionHistory)
class PromotionHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'promotion', 'user', 'action', 'created_at']
    list_filter = ['action']
    search_fields = ['promotion__employee__user__username', 'comment']
    raw_id_fields = ['promotion', 'user']
    readonly_fields = ['created_at']


@admin.register(CareerPath)
class CareerPathAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'department']
    list_filter = ['department']
    search_fields = ['title', 'description']