from django.urls import path
from .views import (
    TaskListCreateView,
    TaskDetailUpdateView,
    DailyLogListCreateView,
    DailyLogDetailView,
)

urlpatterns = [
    path("tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", TaskDetailUpdateView.as_view(), name="task-detail-update"),
    path("daily-logs/", DailyLogListCreateView.as_view(), name="daily-log-list-create"),
    path("daily-logs/<int:pk>/", DailyLogDetailView.as_view(), name="daily-log-detail"),
]
