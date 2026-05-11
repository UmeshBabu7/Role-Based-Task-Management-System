from django.db import models
from django.conf import settings
from .task import Task


class DailyLog(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="daily_logs")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_logs"
    )
    note = models.TextField()
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_at"]

    def __str__(self):
        return f"{self.user.email} - {self.task.title} ({self.logged_at.date()})"
