from rest_framework import serializers
from .models import Employee
from users.models import User


class EmployeeSerializer(serializers.ModelSerializer):

    create_user = serializers.BooleanField(write_only=True, required=False)

    # 🔹 ID du compte utilisateur
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "birth_date",
            "hire_date",
            "department",
            "promotion",
            "user_id",        # IMPORTANT
            "create_user"
        ]

    def create(self, validated_data):

        create_user = validated_data.pop("create_user", False)

        employee = Employee.objects.create(**validated_data)

        if create_user:

            username = validated_data["email"]

            user = User.objects.create_user(
                username=username,
                email=validated_data["email"],
                password="12345678",
                role="EMPLOYEE",
                phone=validated_data.get("phone", "")
            )

            employee.user = user
            employee.save()

        return employee