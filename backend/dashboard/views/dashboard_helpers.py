from rest_framework.response import Response
from django.db.models import Count
from users.models import User
from projects.models import Project
from tasks.models import Task, TaskStatus


def admin_dashboard():
    data = {
        "role": "admin",
        "total_users": User.objects.count(),
        "total_projects": Project.objects.count(),
        "total_tasks": Task.objects.count(),
        "users_by_role": list(User.objects.values("role").annotate(count=Count("id"))),
        "tasks_by_status": list(
            Task.objects.values("status").annotate(count=Count("id"))
        ),
    }
    return Response(data)


def manager_dashboard(user):
    projects = Project.objects.filter(created_by=user)
    tasks = Task.objects.filter(project__created_by=user)
    data = {
        "role": "manager",
        "total_projects": projects.count(),
        "total_tasks": tasks.count(),
        "completed_tasks": tasks.filter(status=TaskStatus.DONE).count(),
        "todo_tasks": tasks.filter(status=TaskStatus.TODO).count(),
    }
    return Response(data)


def employee_dashboard(user):
    tasks = Task.objects.filter(assigned_to=user)
    data = {
        "role": "employee",
        "total_assigned_tasks": tasks.count(),
        "completed_tasks": tasks.filter(status=TaskStatus.DONE).count(),
    }
    return Response(data)
