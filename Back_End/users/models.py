from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    ROLE_CHOICES = [
        ("ADMIN", "Administrateur"),
        ("EMPLOYEE", "Employé"),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="EMPLOYEE"
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    email = models.EmailField(
        unique=True
    )

    def save(self, *args, **kwargs):

        # si superuser → admin automatiquement
        if self.is_superuser:
            self.role = "ADMIN"

        super().save(*args, **kwargs)

    def __str__(self):

        return f"{self.username} ({self.role})"