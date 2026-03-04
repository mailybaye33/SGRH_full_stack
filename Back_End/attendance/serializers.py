from rest_framework import serializers
from django.utils import timezone
from .models import Attendance
from employees.models import Employee
from employees.serializers import EmployeeListSerializer

class AttendanceSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), 
        source='employee', 
        write_only=True
    )
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['hours_worked', 'overtime']

class CheckInSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)

class CheckOutSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)