from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    TokenRefreshCookieView,
    UserListCreateView,
    EmployeeListView,
    MeView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "token/refresh/", TokenRefreshCookieView.as_view(), name="token-refresh-cookie"
    ),
    path("users/me/", MeView.as_view(), name="user-me"),
    path("users/", UserListCreateView.as_view(), name="user-list-create"),
    path("employees/", EmployeeListView.as_view(), name="employee-list"),
]
