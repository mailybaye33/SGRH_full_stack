from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .models import User
from .serializers import UserSerializer, LoginSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        # Permettre l'accès sans authentification pour login/register
        if self.action in ['login', 'current_user', 'register']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """API de connexion pour React"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'message': 'Connexion réussie'
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """API de déconnexion pour React"""
        logout(request)
        return Response({
            'success': True,
            'message': 'Déconnexion réussie'
        })
    
    @action(detail=False, methods=['get'])
    def current_user(self, request):
        """Récupérer l'utilisateur actuellement connecté"""
        if request.user.is_authenticated:
            return Response({
                'success': True,
                'user': UserSerializer(request.user).data
            })
        return Response({
            'success': False,
            'message': 'Non authentifié'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """API d'inscription (optionnel)"""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # Pour l'inscription, tu devras peut-être créer un serializer spécial
            # car UserSerializer n'inclut pas le password
            user = serializer.save()
            login(request, user)
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'message': 'Inscription réussie'
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)