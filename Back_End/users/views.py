from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate

from .models import User
from .serializers import UserSerializer, RegisterSerializer
from .permissions import IsAdmin

from employees.models import Employee


# ===============================
# LISTE UTILISATEURS
# ===============================

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
from .permissions import IsAdmin


class UserListView(generics.ListCreateAPIView):

    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated, IsAdmin]


# ===============================
# DETAIL UTILISATEUR
# ===============================

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = User.objects.all()

    serializer_class = UserSerializer

    permission_classes = [IsAuthenticated, IsAdmin]

    # IMPORTANT
    # supprimer la liaison avec employee avant suppression

    def perform_destroy(self, instance):

        try:

            employee = instance.employee

            employee.user = None
            employee.save()

        except Employee.DoesNotExist:
            pass

        instance.delete()


# ===============================
# INSCRIPTION
# ===============================

class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer


# ===============================
# LOGIN
# ===============================

class LoginAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get("email")
        password = request.data.get("password")

        try:

            user = User.objects.get(email=email)

        except User.DoesNotExist:

            return Response(
                {"error": "Utilisateur non trouvé"},
                status=400
            )

        user = authenticate(
            username=user.username,
            password=password
        )

        if user is None:

            return Response(
                {"error": "Mot de passe incorrect"},
                status=400
            )

        token, created = Token.objects.get_or_create(user=user)

        return Response({

            "token": token.key,
            "id": user.id,      # IMPORTANT
            "email": user.email,
            "username": user.username,  # IMPORTANT
            "role": user.role

        })

class CurrentUserView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(request.user)

        return Response(serializer.data)