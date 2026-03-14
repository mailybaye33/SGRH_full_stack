from django.db import models
from employees.models import Employee


class Leave(models.Model):

    STATUS = [

        ("pending", "En attente"),
        ("approved", "Accepté"),
        ("rejected", "Refusé")

    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="leaves"
    )

    start_date = models.DateField()

    end_date = models.DateField()

    days = models.IntegerField()

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="pending"
    )

    def calculate_days(self):

        self.days = (
            self.end_date - self.start_date
        ).days + 1

    def save(self, *args, **kwargs):

        self.calculate_days()

        super().save(*args, **kwargs)

    def __str__(self):

        return f"{self.employee} {self.status}"