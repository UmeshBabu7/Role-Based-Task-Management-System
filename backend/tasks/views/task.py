from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Task
from ..serializers import (
    TaskSerializer,
    TaskCreateSerializer,
    TaskStatusUpdateSerializer,
    TaskManagerUpdateSerializer,
)
from users.permissions import IsManager
from users.models import UserRole


class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TaskCreateSerializer
        return TaskSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsManager()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related("project", "assigned_to")
        if user.role == UserRole.ADMIN:
            return qs.all()
        elif user.role == UserRole.MANAGER:
            return qs.filter(project__created_by=user)
        elif user.role == UserRole.EMPLOYEE:
            return qs.filter(assigned_to=user)
        return Task.objects.none()


class TaskDetailUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_serializer_class(self):
        user = self.request.user
        if self.request.method == "PATCH":
            if user.role == UserRole.EMPLOYEE:
                return TaskStatusUpdateSerializer
            elif user.role == UserRole.MANAGER:
                return TaskManagerUpdateSerializer
        return TaskSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Task.objects.select_related("project", "assigned_to")
        if user.role == UserRole.ADMIN:
            return qs.all()
        elif user.role == UserRole.MANAGER:
            return qs.filter(project__created_by=user)
        elif user.role == UserRole.EMPLOYEE:
            return qs.filter(assigned_to=user)
        return Task.objects.none()

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if user.role == UserRole.ADMIN:
            return Response(
                {"detail": "Admins cannot update tasks."},
                status=status.HTTP_403_FORBIDDEN,
            )
        task = self.get_object()
        serializer = self.get_serializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        task = Task.objects.select_related("project", "assigned_to").get(pk=task.pk)
        return Response(TaskSerializer(task, context={"request": request}).data)
