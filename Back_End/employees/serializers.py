from rest_framework import serializers
from .models import Employee
from users.serializers import UserSerializer

class EmployeeSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['user']