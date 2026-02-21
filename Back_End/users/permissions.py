# users/permissions.py
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Permission pour les administrateurs"""
    def has_permission(self, request, view):
        return request.user and (
            request.user.is_superuser or 
            getattr(request.user, 'role', '') == 'ADMIN'
        )

class IsManagerOrAdmin(permissions.BasePermission):
    """Permission pour les managers et administrateurs"""
    def has_permission(self, request, view):
        if not request.user:
            return False
        role = getattr(request.user, 'role', '')
        return request.user.is_superuser or role in ['ADMIN', 'MANAGER', 'HR']

class IsEmployee(permissions.BasePermission):
    """Permission pour les employés"""
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'employee_profile')