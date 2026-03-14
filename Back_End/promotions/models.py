from django.db import models


class Promotion(models.Model):

    name = models.CharField(
        max_length=100
    )

    base_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    description = models.TextField(
        blank=True
    )

    def __str__(self):

        return self.name