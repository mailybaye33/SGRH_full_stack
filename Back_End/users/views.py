# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'num_phone', 'role', 'is_active', 'date_joined', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['date_joined']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError("Ce compte est désactivé.")
            else:
                raise serializers.ValidationError("Identifiants incorrects.")
        else:
            raise serializers.ValidationError("Nom d'utilisateur et mot de passe requis.")
        
        return data