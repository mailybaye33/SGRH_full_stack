import datetime
from django.db import models
from employees.models import Employee


class Attendance(models.Model):

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE
    )

    date = models.DateField()

    check_in = models.TimeField()

    check_out = models.TimeField(
        null=True,
        blank=True
    )

    worked_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    overtime_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    missing_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    def calculate_hours(self):

        if not self.check_in or not self.check_out:
            return

        start = datetime.datetime.combine(self.date, self.check_in)
        end = datetime.datetime.combine(self.date, self.check_out)

        diff = end - start
        hours = diff.total_seconds() / 3600

        self.worked_hours = hours

        weekday = self.date.weekday()

        if weekday <= 3:
            normal_hours = 8
        elif weekday == 4:
            normal_hours = 4
        else:
            normal_hours = 0

        if hours > normal_hours:
            self.overtime_hours = hours - normal_hours
            self.missing_hours = 0

        elif hours < normal_hours:
            self.missing_hours = normal_hours - hours
            self.overtime_hours = 0

        else:
            self.overtime_hours = 0
            self.missing_hours = 0


    def save(self, *args, **kwargs):

        if self.check_in and self.check_out:
            self.calculate_hours()

        super().save(*args, **kwargs)