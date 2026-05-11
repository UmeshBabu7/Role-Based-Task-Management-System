from django.db import models


class UserRole(models.TextChoices):
    ADMIN = "admin", "Admin"
    MANAGER = "manager", "Manager"
    EMPLOYEE = "employee", "Employee"
