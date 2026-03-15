from django.db import models
from employees.models import Employee
from attendance.models import Attendance


class Salary(models.Model):

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="salaries"
    )

    month = models.IntegerField()
    year = models.IntegerField()

    total_bonus = models.FloatField(default=0)
    total_deductions = models.FloatField(default=0)

    final_salary = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def calculate_salary(self):

        base_salary = self.employee.promotion.base_salary

        # tarif horaire
        hourly_rate = base_salary / (22 * 8)

        attendances = Attendance.objects.filter(
            employee=self.employee,
            date__month=self.month,
            date__year=self.year
        )

        total_bonus = 0
        total_deductions = 0

        for att in attendances:

            weekday = att.date.weekday()

            # heures normales
            if weekday <= 3:
                normal_hours = 8

            elif weekday == 4:
                normal_hours = 4

            else:
                normal_hours = 0

            worked = att.worked_hours or 0

            # heures supplémentaires
            if worked > normal_hours:

                extra = worked - normal_hours

                total_bonus += extra * hourly_rate

            # heures manquantes
            elif worked < normal_hours:

                missing = normal_hours - worked

                total_deductions += missing * hourly_rate

            self.total_bonus = total_bonus
            self.total_deductions = total_deductions

            self.final_salary = (
                base_salary +
                total_bonus -
                total_deductions
            )