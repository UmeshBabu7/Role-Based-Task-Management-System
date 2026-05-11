from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models import UserRole
from .dashboard_helpers import admin_dashboard, manager_dashboard, employee_dashboard


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == UserRole.ADMIN:
            return admin_dashboard()
        elif user.role == UserRole.MANAGER:
            return manager_dashboard(user)
        elif user.role == UserRole.EMPLOYEE:
            return employee_dashboard(user)
        return Response({"detail": "Unknown role."}, status=403)
