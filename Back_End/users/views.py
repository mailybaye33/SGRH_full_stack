# users/views.py
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token

from .models import User
from .serializers import UserSerializer, LoginSerializer

# ========== AUTHENTICATION VIEWS ==========

@method_decorator(csrf_exempt, name='dispatch')
class SimpleLoginAPIView(APIView):
    """Vue simplifiée pour l'authentification"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            if user.is_active:
                login(request, user)
                return Response({
                    'success': True,
                    'message': 'Connexion réussie',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'num_phone': user.num_phone,
                        'role': user.role,
                        'is_active': user.is_active,
                        'is_staff': user.is_staff,
                        'date_joined': user.date_joined,
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': 'Ce compte est désactivé.'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'success': False,
                'error': 'Identifiants incorrects.'
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    """API pour l'authentification"""
    permission_classes = [AllowAny]
    
    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            
            return Response({
                'success': True,
                'message': 'Connexion réussie',
                'user': UserSerializer(user).data,
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    """API pour déconnexion - Temporairement AllowAny pour tests"""
    permission_classes = [AllowAny]  # Changez de IsAuthenticated à AllowAny temporairement
    
    def post(self, request, format=None):
        # Vérifiez manuellement si l'utilisateur est authentifié
        if request.user.is_authenticated:
            username = request.user.username
            logout(request)
            return Response({
                'success': True,
                'message': f'Utilisateur {username} déconnecté avec succès'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'message': 'Aucun utilisateur authentifié'
            }, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserAPIView(APIView):
    """API pour récupérer l'utilisateur connecté"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CheckAuthAPIView(APIView):
    """API pour vérifier l'authentification"""
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        if request.user.is_authenticated:
            return Response({
                'authenticated': True,
                'user': UserSerializer(request.user).data
            }, status=status.HTTP_200_OK)
        return Response({
            'authenticated': False
        }, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenAPIView(APIView):
    """API pour obtenir le token CSRF"""
    permission_classes = [AllowAny]
    
    def get(self, request, format=None):
        return Response({
            'csrftoken': get_token(request)
        }, status=status.HTTP_200_OK)


# ========== USER MANAGEMENT VIEWS ==========

class UserListCreateAPIView(generics.ListCreateAPIView):
    """API pour lister et créer des utilisateurs (admin seulement)"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def perform_create(self, serializer):
        user = serializer.save()
        password = self.request.data.get('password')
        if password:
            user.set_password(password)
            user.save()


class UserDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API pour gérer un utilisateur spécifique"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        password = request.data.get('password')
        if password:
            user = self.get_object()
            user.set_password(password)
            user.save()
        return response
    

@method_decorator(csrf_exempt, name='dispatch')
class TestLogoutView(APIView):
    """Vue de test pour logout - aucune restriction"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("=== TEST LOGOUT APPELÉ ===")
        print(f"Utilisateur authentifié: {request.user.is_authenticated}")
        print(f"Utilisateur: {request.user}")
        
        if request.user.is_authenticated:
            username = request.user.username
            logout(request)
            print(f"Utilisateur {username} déconnecté")
            return Response({
                'test': True,
                'success': True,
                'message': f'Test logout réussi pour {username}'
            })
        else:
            print("Aucun utilisateur à déconnecter")
            return Response({
                'test': True,
                'success': False,
                'message': 'Aucun utilisateur authentifié'
            }, status=400)