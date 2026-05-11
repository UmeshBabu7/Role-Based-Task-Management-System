from rest_framework import serializers
from ..models import Task, TaskStatus
from users.models import UserRole


class TaskManagerUpdateSerializer(serializers.ModelSerializer):
    """Managers can update status and assigned_to only."""

    class Meta:
        model = Task
        fields = ["status", "assigned_to"]

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


class TaskStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ["status"]

    def validate_status(self, value):
        if value not in [choice[0] for choice in TaskStatus.choices]:
            raise serializers.ValidationError("Invalid status.")
        return value
