# promotions/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import PromotionType, Promotion, PromotionHistory, CareerPath
from employees.models import Employee
from employees.serializers import EmployeeListSerializer
from departments.serializers import DepartmentSerializer

class PromotionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionType
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class PromotionListSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    promotion_type_name = serializers.CharField(source='promotion_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Promotion
        fields = [
            'id', 'employee', 'employee_id', 'employee_name',
            'promotion_type', 'promotion_type_name',
            'old_position', 'new_position',
            'promotion_date', 'effective_date',
            'salary_increase', 'salary_increase_percentage',
            'status', 'status_display',
            'created_at'
        ]
        read_only_fields = ['salary_increase', 'salary_increase_percentage']


class PromotionDetailSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    promotion_type_details = PromotionTypeSerializer(source='promotion_type', read_only=True)
    old_department_name = serializers.CharField(source='old_department.name', read_only=True)
    new_department_name = serializers.CharField(source='new_department.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Promotion
        fields = '__all__'
        read_only_fields = [
            'salary_increase', 'salary_increase_percentage',
            'approved_at', 'created_at', 'updated_at'
        ]


class PromotionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = [
            'employee', 'promotion_type',
            'old_position', 'old_department', 'old_salary', 'old_grade',
            'new_position', 'new_department', 'new_salary', 'new_grade',
            'promotion_date', 'effective_date', 'reason', 'comments', 'document'
        ]
    
    def validate(self, data):
        # Vérifier que la date de promotion n'est pas dans le futur lointain
        if data['promotion_date'] > timezone.now().date() + timezone.timedelta(days=365):
            raise serializers.ValidationError(
                "La date de promotion ne peut pas être à plus d'un an dans le futur"
            )
        
        # Vérifier que la date d'effet est après ou égale à la date de promotion
        if data['effective_date'] < data['promotion_date']:
            raise serializers.ValidationError(
                "La date d'effet doit être postérieure ou égale à la date de promotion"
            )
        
        # Vérifier que le nouveau salaire est supérieur à l'ancien
        if data['old_salary'] and data['new_salary'] <= data['old_salary']:
            raise serializers.ValidationError(
                "Le nouveau salaire doit être supérieur à l'ancien"
            )
        
        return data


class PromotionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = [
            'promotion_type', 'new_position', 'new_department',
            'new_salary', 'new_grade', 'effective_date',
            'reason', 'comments', 'document'
        ]


class PromotionApproveSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject', 'implement'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)


class PromotionHistorySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = PromotionHistory
        fields = '__all__'
        read_only_fields = ['created_at']


class CareerPathSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = CareerPath
        fields = '__all__'


class PromotionStatisticsSerializer(serializers.Serializer):
    total_promotions = serializers.IntegerField()
    approved_promotions = serializers.IntegerField()
    pending_promotions = serializers.IntegerField()
    average_increase = serializers.FloatField()
    by_department = serializers.ListField(child=serializers.DictField())
    by_month = serializers.ListField(child=serializers.DictField())