from rest_framework import serializers
from ..models import Task
from users.serializers import UserMinimalSerializer


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserMinimalSerializer(read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "project",
            "project_name",
            "assigned_to",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
