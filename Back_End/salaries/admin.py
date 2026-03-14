from django.contrib import admin
from .models import Salary


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):

    list_display = [
        "employee",
        "month",
        "year",
        "total_hours",
        "total_bonus",
        "total_deductions",
        "final_salary"
    ]

    list_filter = [
        "month",
        "year"
    ]