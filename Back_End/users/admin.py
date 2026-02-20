from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'num_phone', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Informations personnelles'), {'fields': ('num_phone',)}),
        (_('Permissions'), {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Dates importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'num_phone', 'password1', 'password2', 'role', 'is_staff', 'is_superuser'),
        }),
    )
    
    search_fields = ('username', 'num_phone')
    ordering = ('-date_joined',)
    filter_horizontal = ('groups', 'user_permissions',)