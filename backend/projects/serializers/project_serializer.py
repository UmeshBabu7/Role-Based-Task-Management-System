from rest_framework import serializers
from ..models import Project
from users.serializers import UserMinimalSerializer


class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    task_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "created_by",
            "task_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]
