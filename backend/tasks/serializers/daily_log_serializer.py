from rest_framework import serializers
from ..models import DailyLog
from users.serializers import UserMinimalSerializer


class DailyLogSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)

    class Meta:
        model = DailyLog
        fields = ["id", "task", "task_title", "user", "note", "logged_at"]
        read_only_fields = ["id", "user", "logged_at"]

    def validate_task(self, task):
        return task
