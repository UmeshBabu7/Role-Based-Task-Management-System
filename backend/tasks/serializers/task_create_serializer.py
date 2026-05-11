from rest_framework import serializers
from ..models import Task
from users.models import UserRole


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "project",
            "assigned_to",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_project(self, project):
        user = self.context["request"].user
        if project.created_by != user:
            raise serializers.ValidationError(
                "You can only create tasks in your own projects."
            )
        return project

    def validate_assigned_to(self, assigned_to):
        if assigned_to and assigned_to.role != UserRole.EMPLOYEE:
            raise serializers.ValidationError(
                "Tasks can only be assigned to employees."
            )
        if assigned_to and not assigned_to.is_active:
            raise serializers.ValidationError(
                "Cannot assign task to an inactive employee."
            )
        return assigned_to
