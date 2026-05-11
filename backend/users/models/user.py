from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .choices import UserRole
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    role = models.CharField(
        max_length=20, choices=UserRole.choices, default=UserRole.EMPLOYEE
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.email} ({self.role})"
