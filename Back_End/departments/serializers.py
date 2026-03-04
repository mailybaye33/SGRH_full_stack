# departments/serializers.py
from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(read_only=True)
    sub_departments_count = serializers.IntegerField(read_only=True)
    
    # ✅ CORRECTION: head_name sans source car c'est le même nom
    head_name = serializers.CharField(read_only=True)  # ← Retiré source='head_name'
    
    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'description', 'head', 'head_name',
            'parent_department', 'sub_departments_count', 'budget',
            'location', 'phone', 'email', 'employee_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']


class DepartmentListSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'employee_count', 'location']


class DepartmentDetailSerializer(serializers.ModelSerializer):
    employees = serializers.SerializerMethodField()
    sub_departments = serializers.SerializerMethodField()
    head_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = '__all__'
    
    def get_employees(self, obj):
        employees = obj.employees.all()[:10]
        from employees.serializers import EmployeeListSerializer
        return EmployeeListSerializer(employees, many=True).data
    
    def get_sub_departments(self, obj):
        subs = obj.sub_departments.all()
        return DepartmentListSerializer(subs, many=True).data
    
    def get_head_details(self, obj):
        if obj.head:
            from employees.serializers import EmployeeListSerializer
            return EmployeeListSerializer(obj.head).data
        return None