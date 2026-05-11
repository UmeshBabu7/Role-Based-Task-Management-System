from rest_framework.permissions import BasePermission
from .models import UserRole


class IsAdmin(BasePermission):
    """Only Admin users can access."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.ADMIN


class IsManager(BasePermission):
    """Only Manager users can access."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.MANAGER


class IsEmployee(BasePermission):
    """Only Employee users can access."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.EMPLOYEE


class IsAdminOrManager(BasePermission):
    """Admin or Manager users can access."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.ADMIN,
            UserRole.MANAGER,
        ]


class IsManagerOrEmployee(BasePermission):
    """Manager or Employee users can access."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [
            UserRole.MANAGER,
            UserRole.EMPLOYEE,
        ]
