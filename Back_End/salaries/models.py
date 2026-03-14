from django.db import models
from employees.models import Employee


class Salary(models.Model):

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="salaries"
    )

    month = models.IntegerField()
    year = models.IntegerField()

    total_hours = models.FloatField(default=0)

    total_bonus = models.FloatField(default=0)
    total_deductions = models.FloatField(default=0)

    final_salary = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_salary(self):

        base_salary = self.employee.promotion.base_salary

        self.final_salary = (
            base_salary +
            self.total_bonus -
            self.total_deductions
        )

    def save(self, *args, **kwargs):

        self.calculate_salary()

        super().save(*args, **kwargs)

    def __str__(self):

        return f"{self.employee} - {self.month}/{self.year}"