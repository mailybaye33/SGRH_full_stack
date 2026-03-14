# users/permissions.py
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):

    def has_permission(self, request, view):

        return request.user.role == "ADMIN"


class IsEmployee(permissions.BasePermission):

    def has_permission(self, request, view):

        return request.user.role == "EMPLOYEE"