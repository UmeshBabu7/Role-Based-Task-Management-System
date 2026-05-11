from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from ..models import Project
from ..serializers import ProjectSerializer, ProjectCreateSerializer
from users.permissions import IsManager
from users.models import UserRole


class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProjectCreateSerializer
        return ProjectSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsManager()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.annotate(task_count=Count("tasks"))
        if user.role == UserRole.ADMIN:
            return qs.select_related("created_by")
        elif user.role == UserRole.MANAGER:
            return qs.filter(created_by=user).select_related("created_by")
        return Project.objects.none()
