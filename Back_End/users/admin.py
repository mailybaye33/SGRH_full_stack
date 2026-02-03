from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User
from employees.models import Employee

class EmployeeInline(admin.StackedInline):
    model = Employee
    can_delete = False
    verbose_name_plural = 'Informations employé'
    fk_name = 'user'

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # ENLÈVE filter_horizontal car tu n'as pas groups/user_permissions
    list_display = ('username', 'num_phone', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Informations personnelles'), {'fields': ('num_phone',)}),
        (_('Permissions'), {'fields': ('role', 'is_active')}),
        (_('Dates importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'num_phone', 'password1', 'password2', 'role'),
        }),
    )
    
    search_fields = ('username', 'num_phone')
    ordering = ('-date_joined',)
    filter_horizontal = ()  # LAISSE VIDE
    
    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(UserAdmin, self).get_inline_instances(request, obj)