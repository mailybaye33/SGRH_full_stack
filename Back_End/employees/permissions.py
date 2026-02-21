# employees/permissions.py
from rest_framework import permissions

class IsEmployeeOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.employee.user == request.user or request.user.is_staff