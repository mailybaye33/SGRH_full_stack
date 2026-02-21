# leaves/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import LeaveType, LeaveBalance, Leave, LeavePeriod, LeaveRequestHistory
from employees.models import Employee
from employees.serializers import EmployeeListSerializer

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class LeaveBalanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    
    class Meta:
        model = LeaveBalance
        fields = '__all__'
        read_only_fields = ['id', 'remaining_days', 'created_at', 'updated_at']


class LeaveListSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    leave_type_color = serializers.CharField(source='leave_type.color', read_only=True)
    duration = serializers.FloatField(source='duration_days', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Leave
        fields = [
            'id', 'employee', 'employee_id', 'employee_name',
            'leave_type', 'leave_type_name', 'leave_type_color',
            'start_date', 'end_date', 'duration', 'reason',
            'status', 'status_display', 'approved_by', 'approved_at',
            'created_at', 'is_current', 'is_past', 'is_upcoming'
        ]
        read_only_fields = ['created_at', 'approved_at']


class LeaveDetailSerializer(serializers.ModelSerializer):
    employee_details = EmployeeListSerializer(source='employee', read_only=True)
    leave_type_details = LeaveTypeSerializer(source='leave_type', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    duration = serializers.FloatField(source='duration_days', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'approved_at']


class LeaveCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = [
            'employee', 'leave_type', 'start_date', 'end_date',
            'start_half_day', 'end_half_day', 'reason', 'comments', 'attachment'
        ]
    
    def validate(self, data):
        # Vérifier que la date de début est avant la date de fin
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError(
                "La date de début doit être antérieure à la date de fin"
            )
        
        # Vérifier que la date de début n'est pas dans le passé
        if data['start_date'] < timezone.now().date():
            raise serializers.ValidationError(
                "La date de début ne peut pas être dans le passé"
            )
        
        # Vérifier les chevauchements de congés
        employee = data['employee']
        start = data['start_date']
        end = data['end_date']
        
        overlapping = Leave.objects.filter(
            employee=employee,
            status__in=['pending', 'approved', 'in_progress']
        ).filter(
            start_date__lte=end,
            end_date__gte=start
        ).exclude(pk=self.instance.pk if self.instance else None)
        
        if overlapping.exists():
            raise serializers.ValidationError(
                "Une demande de congé existe déjà pour cette période"
            )
        
        # Vérifier le solde de congés
        try:
            balance = LeaveBalance.objects.get(
                employee=employee,
                leave_type=data['leave_type'],
                year=start.year
            )
            
            duration = (end - start).days + 1
            if data['start_half_day']:
                duration -= 0.5
            if data['end_half_day']:
                duration -= 0.5
            
            if balance.remaining_days < duration:
                raise serializers.ValidationError(
                    f"Solde de congés insuffisant. "
                    f"Disponible: {balance.remaining_days} jours, Demandé: {duration} jours"
                )
                
        except LeaveBalance.DoesNotExist:
            pass
        
        return data


class LeaveUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = [
            'start_date', 'end_date', 'start_half_day', 'end_half_day',
            'reason', 'comments', 'attachment'
        ]


class LeaveApproveSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)


class LeavePeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeavePeriod
        fields = '__all__'


class LeaveHistorySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = LeaveRequestHistory
        fields = '__all__'


class LeaveSummarySerializer(serializers.Serializer):
    """Résumé des congés pour un employé"""
    total_pending = serializers.IntegerField()
    total_approved = serializers.IntegerField()
    total_taken = serializers.IntegerField()
    upcoming = serializers.ListField(child=serializers.DictField())
    balances = serializers.ListField(child=serializers.DictField())