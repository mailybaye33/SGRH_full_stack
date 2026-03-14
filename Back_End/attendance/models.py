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

    def calculate_hours(self):

        weekday = self.date.weekday()

        # samedi et dimanche → pas de travail
        if weekday in [5, 6]:
            self.worked_hours = 0
            return

        start = datetime.time(8, 0)

        # vendredi
        if weekday == 4:
            end = datetime.time(12, 0)
        else:
            end = datetime.time(16, 0)

        if self.check_in and self.check_in < start:
            self.check_in = start

        if self.check_out and self.check_out > end:
            self.check_out = end

        if self.check_in and self.check_out:

            diff = (
                datetime.datetime.combine(
                    datetime.date.today(),
                    self.check_out
                )
                -
                datetime.datetime.combine(
                    datetime.date.today(),
                    self.check_in
                )
            )

            self.worked_hours = diff.total_seconds() / 3600


    def save(self, *args, **kwargs):

        # calcul seulement si sortie existe
        if self.check_in and self.check_out:
            self.calculate_hours()

        super().save(*args, **kwargs)