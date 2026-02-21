# promotions/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from .models import PromotionType, Promotion, PromotionHistory, CareerPath
from .serializers import (
    PromotionTypeSerializer, PromotionListSerializer, PromotionDetailSerializer,
    PromotionCreateSerializer, PromotionUpdateSerializer, PromotionApproveSerializer,
    PromotionHistorySerializer, CareerPathSerializer, PromotionStatisticsSerializer
)
from employees.models import Employee
from users.permissions import IsAdminUser, IsManagerOrAdmin


# ==================== VUES POUR PROMOTION TYPE ====================

class PromotionTypeListCreateView(generics.ListCreateAPIView):
    """Liste et création des types de promotion"""
    queryset = PromotionType.objects.all()
    serializer_class = PromotionTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name', 'code', 'description']
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]


class PromotionTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un type de promotion"""
    queryset = PromotionType.objects.all()
    serializer_class = PromotionTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]


# ==================== VUES POUR PROMOTION ====================

class PromotionListCreateView(generics.ListCreateAPIView):
    """Liste et création des promotions"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'promotion_type', 'status', 'promotion_date']
    search_fields = [
        'employee__user__first_name', 'employee__user__last_name',
        'old_position', 'new_position', 'reason'
    ]
    ordering_fields = ['promotion_date', 'effective_date', 'created_at']
    ordering = ['-promotion_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PromotionCreateSerializer
        return PromotionListSerializer
    
    def get_queryset(self):
        return Promotion.objects.select_related(
            'employee__user', 'promotion_type', 'old_department', 'new_department'
        ).all()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PromotionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une promotion"""
    queryset = Promotion.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PromotionDetailSerializer
        elif self.request.method in ['PUT', 'PATCH']:
            return PromotionUpdateSerializer
        return PromotionDetailSerializer


class PromotionApproveView(APIView):
    """Approuver, refuser ou implémenter une promotion"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def post(self, request, pk):
        try:
            promotion = Promotion.objects.get(pk=pk)
        except Promotion.DoesNotExist:
            return Response(
                {'error': 'Promotion non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PromotionApproveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        action = serializer.validated_data['action']
        old_status = promotion.status
        
        if action == 'approve':
            promotion.approve(request.user)
            message = 'Promotion approuvée'
        elif action == 'reject':
            rejection_reason = serializer.validated_data.get('rejection_reason', '')
            promotion.reject(request.user, rejection_reason)
            message = 'Promotion refusée'
        elif action == 'implement':
            promotion.implement()
            message = 'Promotion implémentée'
        
        # Créer une entrée dans l'historique
        PromotionHistory.objects.create(
            promotion=promotion,
            user=request.user,
            action=action,
            old_status=old_status,
            new_status=promotion.status
        )
        
        return Response({
            'success': True,
            'message': message,
            'status': promotion.status
        })


class PromotionByEmployeeView(generics.ListAPIView):
    """Liste des promotions d'un employé spécifique"""
    serializer_class = PromotionListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        employee_id = self.kwargs.get('employee_id')
        return Promotion.objects.filter(employee_id=employee_id).order_by('-promotion_date')


class PendingPromotionsView(generics.ListAPIView):
    """Liste des promotions en attente"""
    serializer_class = PromotionListSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_queryset(self):
        return Promotion.objects.filter(status='pending').order_by('promotion_date')


class RecentPromotionsView(generics.ListAPIView):
    """Liste des promotions récentes"""
    serializer_class = PromotionListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        last_30_days = timezone.now().date() - timedelta(days=30)
        return Promotion.objects.filter(
            promotion_date__gte=last_30_days,
            status='implemented'
        ).order_by('-promotion_date')[:20]


# ==================== VUES POUR HISTORIQUE ====================

class PromotionHistoryView(generics.ListAPIView):
    """Historique d'une promotion"""
    serializer_class = PromotionHistorySerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_queryset(self):
        promotion_id = self.kwargs.get('promotion_id')
        return PromotionHistory.objects.filter(promotion_id=promotion_id).order_by('-created_at')


# ==================== VUES POUR CAREER PATH ====================

class CareerPathListCreateView(generics.ListCreateAPIView):
    """Liste et création des chemins de carrière"""
    queryset = CareerPath.objects.all()
    serializer_class = CareerPathSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department']
    search_fields = ['title', 'description']


class CareerPathDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un chemin de carrière"""
    queryset = CareerPath.objects.all()
    serializer_class = CareerPathSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]


# ==================== VUES POUR STATISTIQUES ====================

class PromotionStatisticsView(APIView):
    """Statistiques des promotions"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        start_date = timezone.datetime(year, 1, 1).date()
        end_date = timezone.datetime(year, 12, 31).date()
        
        promotions = Promotion.objects.filter(
            promotion_date__range=[start_date, end_date]
        )
        
        # Statistiques globales
        total = promotions.count()
        approved = promotions.filter(status='approved').count()
        implemented = promotions.filter(status='implemented').count()
        pending = promotions.filter(status='pending').count()
        
        # Augmentation moyenne
        avg_increase = promotions.filter(
            salary_increase__isnull=False
        ).aggregate(avg=Avg('salary_increase'))['avg'] or 0
        
        avg_percentage = promotions.filter(
            salary_increase_percentage__isnull=False
        ).aggregate(avg=Avg('salary_increase_percentage'))['avg'] or 0
        
        # Par département
        dept_stats = []
        from departments.models import Department
        for dept in Department.objects.all():
            dept_promotions = promotions.filter(new_department=dept)
            dept_stats.append({
                'department': dept.name,
                'count': dept_promotions.count(),
                'avg_increase': float(dept_promotions.aggregate(avg=Avg('salary_increase'))['avg'] or 0)
            })
        
        # Par mois
        month_stats = []
        for month in range(1, 13):
            month_promotions = promotions.filter(promotion_date__month=month)
            month_stats.append({
                'month': month,
                'count': month_promotions.count(),
                'avg_increase': float(month_promotions.aggregate(avg=Avg('salary_increase'))['avg'] or 0)
            })
        
        data = {
            'year': year,
            'total_promotions': total,
            'approved_promotions': approved,
            'implemented_promotions': implemented,
            'pending_promotions': pending,
            'average_increase': float(avg_increase),
            'average_percentage': float(avg_percentage),
            'by_department': dept_stats,
            'by_month': month_stats
        }
        
        serializer = PromotionStatisticsSerializer(data)
        return Response(serializer.data)


class EmployeeCareerPathView(APIView):
    """Chemin de carrière suggéré pour un employé"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get(self, request, employee_id):
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employé non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Récupérer l'historique des promotions
        promotions = Promotion.objects.filter(
            employee=employee,
            status='implemented'
        ).order_by('promotion_date')
        
        # Chercher un chemin de carrière correspondant
        career_paths = CareerPath.objects.filter(
            department=employee.department
        ) or CareerPath.objects.filter(department__isnull=True)
        
        history = PromotionListSerializer(promotions, many=True).data
        paths = CareerPathSerializer(career_paths, many=True).data
        
        # Suggérer la prochaine étape
        next_step = None
        if promotions.exists():
            last_promotion = promotions.last()
            if career_paths.exists():
                levels = career_paths.first().levels
                current_level = last_promotion.new_grade
                if current_level in levels:
                    current_index = levels.index(current_level)
                    if current_index + 1 < len(levels):
                        next_step = levels[current_index + 1]
        
        return Response({
            'employee': employee.employee_id,
            'name': employee.user.get_full_name(),
            'current_position': employee.position,
            'current_grade': employee.grade if hasattr(employee, 'grade') else None,
            'promotion_history': history,
            'available_paths': paths,
            'next_step': next_step
        })