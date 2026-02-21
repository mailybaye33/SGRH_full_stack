# salaries/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import (
    SalaryGrade, EmployeeSalary, SalaryHistory, 
    Payroll, PayrollBatch, SalaryAdvance
)
from employees.models import Employee
from employees.serializers import EmployeeListSerializer

class SalaryGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryGrade
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeSalarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    
    class Meta:
        model = EmployeeSalary
        fields = '__all__'
        read_only_fields = [
            'id', 'gross_salary', 'total_allowances', 
            'tax_amount', 'social_security_amount', 'pension_amount',
            'total_deductions', 'net_salary', 'created_at', 'updated_at'
        ]


class EmployeeSalaryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeSalary
        fields = [
            'employee', 'base_salary', 'hourly_rate', 'grade',
            'payment_method', 'payment_frequency',
            'bank_name', 'bank_account', 'bank_code',
            'housing_allowance', 'transport_allowance', 'food_allowance',
            'phone_allowance', 'other_allowances',
            'tax_rate', 'social_security_rate', 'pension_rate',
            'effective_date', 'is_active'
        ]
    
    def validate(self, data):
        # Vérifier qu'il n'y a pas déjà un salaire actif pour cet employé
        if data.get('is_active', True):
            existing = EmployeeSalary.objects.filter(
                employee=data['employee'],
                is_active=True
            ).exclude(pk=self.instance.pk if self.instance else None)
            
            if existing.exists():
                raise serializers.ValidationError(
                    "Un salaire actif existe déjà pour cet employé"
                )
        return data


class SalaryHistorySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = SalaryHistory
        fields = '__all__'
        read_only_fields = ['created_at']


class PayrollListSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payroll
        fields = [
            'id', 'employee', 'employee_id', 'employee_name',
            'month', 'year', 'gross_salary', 'total_deductions',
            'net_salary', 'payment_date', 'status', 'status_display',
            'created_at'
        ]


class PayrollDetailSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    validated_by_name = serializers.CharField(source='validated_by.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payroll
        fields = '__all__'
        read_only_fields = [
            'gross_salary', 'total_deductions', 'net_salary',
            'validated_at', 'created_at', 'updated_at'
        ]


class PayrollCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payroll
        fields = [
            'employee', 'month', 'year',
            'base_salary', 'hourly_rate', 'hours_worked',
            'overtime_hours', 'overtime_rate',
            'housing_allowance', 'transport_allowance', 'food_allowance',
            'phone_allowance', 'bonus', 'commission', 'thirteenth_month',
            'other_allowances',
            'tax_amount', 'social_security', 'pension',
            'loan_deduction', 'advance_deduction', 'absence_deduction',
            'other_deductions',
            'payment_method', 'bank_name', 'bank_account',
            'notes'
        ]
    
    def validate(self, data):
        # Vérifier qu'il n'y a pas déjà une fiche de paie pour cette période
        existing = Payroll.objects.filter(
            employee=data['employee'],
            month=data['month'],
            year=data['year']
        ).exists()
        
        if existing:
            raise serializers.ValidationError(
                f"Une fiche de paie existe déjà pour {data['month']}/{data['year']}"
            )
        
        return data


class PayrollUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payroll
        fields = [
            'base_salary', 'hourly_rate', 'hours_worked',
            'overtime_hours', 'overtime_rate',
            'housing_allowance', 'transport_allowance', 'food_allowance',
            'phone_allowance', 'bonus', 'commission', 'thirteenth_month',
            'other_allowances',
            'tax_amount', 'social_security', 'pension',
            'loan_deduction', 'advance_deduction', 'absence_deduction',
            'other_deductions',
            'payment_method', 'bank_name', 'bank_account',
            'payment_reference', 'notes'
        ]


class PayrollValidateSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['validate', 'pay', 'cancel'])
    payment_date = serializers.DateField(required=False)


class PayrollBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollBatch
        fields = '__all__'
        read_only_fields = ['total_amount', 'count', 'created_at']


class PayrollBatchCreateSerializer(serializers.Serializer):
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField()
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    name = serializers.CharField(required=False)


class SalaryAdvanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = SalaryAdvance
        fields = '__all__'
        read_only_fields = [
            'id', 'monthly_repayment', 'approved_at',
            'created_at', 'updated_at'
        ]


class SalaryAdvanceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryAdvance
        fields = [
            'employee', 'amount', 'expected_payment_date',
            'reason', 'repayment_months'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0")
        
        # Vérifier que le montant ne dépasse pas 50% du salaire mensuel
        try:
            salary = EmployeeSalary.objects.get(employee=self.initial_data['employee'], is_active=True)
            max_amount = salary.base_salary * 0.5
            if value > max_amount:
                raise serializers.ValidationError(
                    f"Le montant demandé ({value}) dépasse 50% du salaire mensuel ({max_amount})"
                )
        except EmployeeSalary.DoesNotExist:
            pass
        
        return value


class SalaryAdvanceApproveSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject', 'pay'])
    notes = serializers.CharField(required=False, allow_blank=True)


class SalaryStatisticsSerializer(serializers.Serializer):
    total_payroll = serializers.FloatField()
    average_salary = serializers.FloatField()
    min_salary = serializers.FloatField()
    max_salary = serializers.FloatField()
    total_employees = serializers.IntegerField()
    by_department = serializers.ListField(child=serializers.DictField())
    by_grade = serializers.ListField(child=serializers.DictField())
    monthly_evolution = serializers.ListField(child=serializers.DictField())