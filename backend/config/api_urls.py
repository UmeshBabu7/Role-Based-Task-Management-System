from django.urls import path, include

urlpatterns = [
    path("api/v1/", include("users.urls")),
    path("api/v1/", include("projects.urls")),
    path("api/v1/", include("tasks.urls")),
    path("api/v1/", include("dashboard.urls")),
]
