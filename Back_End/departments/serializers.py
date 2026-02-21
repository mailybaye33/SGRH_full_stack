# departments/serializers.py
from rest_framework import serializers
from .models import Department

class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer pour les départements"""
    employee_count = serializers.IntegerField(read_only=True)
    sub_departments_count = serializers.IntegerField(read_only=True)
    head_name = serializers.CharField(source='head_name', read_only=True)
    
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
    """Serializer simplifié pour les listes"""
    employee_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'employee_count', 'location']


class DepartmentDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé avec les relations"""
    employees = serializers.SerializerMethodField()
    sub_departments = serializers.SerializerMethodField()
    head_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = '__all__'
    
    def get_employees(self, obj):
        """Retourne les 10 premiers employés du département"""
        employees = obj.employees.all()[:10]
        from employees.serializers import EmployeeListSerializer
        return EmployeeListSerializer(employees, many=True).data
    
    def get_sub_departments(self, obj):
        """Retourne les sous-départements"""
        subs = obj.sub_departments.all()
        return DepartmentListSerializer(subs, many=True).data
    
    def get_head_details(self, obj):
        """Retourne les détails du chef"""
        if obj.head:
            from employees.serializers import EmployeeListSerializer
            return EmployeeListSerializer(obj.head).data
        return None