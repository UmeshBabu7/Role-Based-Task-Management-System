from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from ..models import Project
from ..serializers import ProjectSerializer
from users.models import UserRole


class ProjectDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.annotate(task_count=Count("tasks")).select_related(
            "created_by"
        )
        if user.role == UserRole.ADMIN:
            return qs
        elif user.role == UserRole.MANAGER:
            return qs.filter(created_by=user)
        return Project.objects.none()
