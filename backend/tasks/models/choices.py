from django.db import models


class TaskStatus(models.TextChoices):
    TODO = "TODO", "To Do"
    DONE = "DONE", "Done"
