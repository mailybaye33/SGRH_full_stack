from django.conf import settings
from django.db import models
from departments.models import Department


class Employee(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="employee"
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    birth_date = models.DateField()
    hire_date = models.DateField()

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        related_name="employees"
    )

    promotion = models.ForeignKey(
        "promotions.Promotion",
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        ordering = ["-hire_date"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    # 🔴 supprimer aussi le compte utilisateur
    def delete(self, *args, **kwargs):

        user = self.user

        super().delete(*args, **kwargs)

        if user:
            user.delete()