# attendance/serializers.py
from rest_framework import serializers
from .models import Attendance, AttendanceSettings
from employees.models import Employee
from employees.serializers import EmployeeListSerializer

class AttendanceSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        source='employee',
        write_only=True
    )
    formatted_check_in = serializers.DateTimeField(source='check_in', format='%d/%m/%Y %H:%M', read_only=True)
    formatted_check_out = serializers.DateTimeField(source='check_out', format='%d/%m/%Y %H:%M', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'
        read_only_fields = ['hours_worked', 'overtime', 'created_at', 'updated_at']

class AttendanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['employee', 'date', 'check_in', 'check_out', 'status', 'notes']

class CheckInSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    photo = serializers.ImageField(required=False)

class CheckOutSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    photo = serializers.ImageField(required=False)

class AttendanceStatsSerializer(serializers.Serializer):
    total_days = serializers.IntegerField()
    present_days = serializers.IntegerField()
    absent_days = serializers.IntegerField()
    late_days = serializers.IntegerField()
    half_days = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    total_hours = serializers.FloatField()
    average_hours = serializers.FloatField()

class AttendanceSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSettings
        fields = '__all__'