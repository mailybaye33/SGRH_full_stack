# serializers.py
from rest_framework import serializers
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):

    employees_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            "id",
            "name",
            "description",
            "employees_count"
        ]

    def get_employees_count(self, obj):
        return obj.employees.count()