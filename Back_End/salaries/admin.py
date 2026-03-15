from django.contrib import admin
from .models import Salary


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):

    list_display = [
        "employee",
        "month",
        "year",
        "total_bonus",
        "total_deductions",
        "final_salary",
        "created_at"
    ]

    list_filter = [
        "month",
        "year"
    ]

    search_fields = [
        "employee__first_name",
        "employee__last_name"
    ]