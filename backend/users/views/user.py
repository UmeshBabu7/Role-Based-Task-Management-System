from rest_framework import generics
from ..models import User, UserRole
from ..serializers import CreateUserSerializer, UserSerializer, UserMinimalSerializer
from ..permissions import IsAdmin, IsManager


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateUserSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.all().order_by("-created_at")


class EmployeeListView(generics.ListAPIView):
    permission_classes = [IsManager]
    serializer_class = UserMinimalSerializer

    def get_queryset(self):
        return User.objects.filter(role=UserRole.EMPLOYEE, is_active=True)
