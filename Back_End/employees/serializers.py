# employees/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Employee, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'user', 'user_full_name', 'department', 'department_name',
            'position', 'hire_date', 'employment_status', 'phone', 'profile_picture'
        ]
    
    def get_user_full_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return ""


class EmployeeDetailSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'employee_id', 'user', 'user_details', 'department', 'department_name',
            'position', 'hire_date', 'employment_status', 'phone', 'address',
            'birth_date', 'emergency_contact_name', 'emergency_contact_phone',
            'profile_picture', 'contract_file', 'created_at', 'updated_at'
        ]
        read_only_fields = ['employee_id', 'created_at', 'updated_at']


class EmployeeCreateUpdateSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        required=True
    )
    department = serializers.PrimaryKeyRelatedField(
        queryset=Employee._meta.get_field('department').remote_field.model.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Employee
        fields = [
            'user', 'department', 'position', 'hire_date', 'employment_status',
            'phone', 'address', 'birth_date', 'emergency_contact_name',
            'emergency_contact_phone', 'profile_picture', 'contract_file'
        ]
    
    def validate_hire_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("La date d'embauche ne peut pas être dans le futur")
        return value
    
    def validate(self, data):
        user = data.get('user')
        if user and self.instance is None:
            if Employee.objects.filter(user=user).exists():
                raise serializers.ValidationError(
                    {"user": "Un employé est déjà associé à cet utilisateur"}
                )
        return data
    
    def create(self, validated_data):
        import random
        random_str = ''.join(random.choices('0123456789', k=5))
        validated_data['employee_id'] = f"EMP-{random_str}"
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'notification_type', 
                  'is_read', 'created_at', 'link']
        read_only_fields = ['created_at']