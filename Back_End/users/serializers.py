from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):

    employee = serializers.SerializerMethodField()
    employee_phone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "role",
            "employee",
            "employee_phone"
        ]

    def get_employee(self, obj):

        if hasattr(obj, "employee") and obj.employee:
            return {
                "first_name": obj.employee.first_name,
                "last_name": obj.employee.last_name
            }

        return None

    def get_employee_phone(self, obj):

        if hasattr(obj, "employee") and obj.employee:
            return obj.employee.phone

        return obj.phone
    
    
class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "password",
            "role"
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            phone=validated_data.get("phone"),
            role=validated_data.get("role", "EMPLOYEE")
        )

        return user