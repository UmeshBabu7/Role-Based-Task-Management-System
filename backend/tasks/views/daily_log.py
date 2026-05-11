from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from ..models import Task, DailyLog
from ..serializers import DailyLogSerializer
from users.permissions import IsManagerOrEmployee, IsEmployee
from users.models import UserRole


class DailyLogListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyLogSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsEmployee()]
        return [IsManagerOrEmployee()]

    def get_queryset(self):
        user = self.request.user
        qs = DailyLog.objects.select_related("task", "task__project", "user")
        if user.role == UserRole.MANAGER:
            return qs.filter(task__project__created_by=user)
        elif user.role == UserRole.EMPLOYEE:
            return qs.filter(user=user)
        return DailyLog.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        task = serializer.validated_data.get("task")
        task = Task.objects.select_related("project__created_by", "assigned_to").get(
            pk=task.pk
        )
        if task.assigned_to != user:
            raise PermissionDenied("You can only log on tasks assigned to you.")
        serializer.save(user=user)


class DailyLogDetailView(generics.RetrieveAPIView):
    serializer_class = DailyLogSerializer
    permission_classes = [IsManagerOrEmployee]

    def get_queryset(self):
        user = self.request.user
        qs = DailyLog.objects.select_related("task", "task__project", "user")
        if user.role == UserRole.MANAGER:
            return qs.filter(task__project__created_by=user)
        elif user.role == UserRole.EMPLOYEE:
            return qs.filter(user=user)
        return DailyLog.objects.none()
