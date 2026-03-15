from rest_framework import serializers
from .models import Salary


class SalarySerializer(serializers.ModelSerializer):

    employee_name = serializers.CharField(
        source="employee.__str__",
        read_only=True
    )

    class Meta:

        model = Salary

        fields = [
            "id",
            "employee",
            "employee_name",
            "month",
            "year",
            "total_bonus",
            "total_deductions",
            "final_salary",
            "created_at"
        ]

        read_only_fields = [
            "final_salary",
            "created_at"
        ]