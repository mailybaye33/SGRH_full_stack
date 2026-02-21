# leaves/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import LeaveType, LeaveBalance, Leave, LeavePeriod, LeaveRequestHistory
from .serializers import (
    LeaveTypeSerializer, LeaveBalanceSerializer, LeaveListSerializer,
    LeaveDetailSerializer, LeaveCreateSerializer, LeaveUpdateSerializer,
    LeaveApproveSerializer, LeavePeriodSerializer, LeaveHistorySerializer,
    LeaveSummarySerializer
)
from employees.models import Employee
from users.permissions import IsAdminUser, IsManagerOrAdmin


# ==================== VUES POUR LEAVE TYPE ====================

class LeaveTypeListCreateView(generics.ListCreateAPIView):
    """Liste et création des types de congés"""
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'default_days']
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]


class LeaveTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un type de congé"""
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]


# ==================== VUES POUR LEAVE BALANCE ====================

class LeaveBalanceListCreateView(generics.ListCreateAPIView):
    """Liste et création des soldes de congés"""
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'year']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    ordering_fields = ['year', 'total_days']


class LeaveBalanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un solde de congé"""
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]


class EmployeeLeaveBalanceView(generics.ListAPIView):
    """Soldes de congés d'un employé spécifique"""
    serializer_class = LeaveBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        employee_id = self.kwargs.get('employee_id')
        year = self.request.query_params.get('year', timezone.now().year)
        
        # Vérifier les permissions
        user = self.request.user
        is_admin = user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'MANAGER', 'HR']
        
        if is_admin:
            return LeaveBalance.objects.filter(employee_id=employee_id, year=year)
        else:
            try:
                employee = user.employee_profile
                if employee.id == int(employee_id):
                    return LeaveBalance.objects.filter(employee=employee, year=year)
            except:
                pass
            return LeaveBalance.objects.none()


# ==================== VUES POUR LEAVE ====================

class LeaveListCreateView(generics.ListCreateAPIView):
    """Liste et création des demandes de congés"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'leave_type', 'status']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'reason']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LeaveCreateSerializer
        return LeaveListSerializer
    
    def get_queryset(self):
        user = self.request.user
        is_admin = user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'MANAGER', 'HR']
        
        if is_admin:
            return Leave.objects.select_related(
                'employee__user', 'leave_type'
            ).all()
        else:
            try:
                employee = user.employee_profile
                return Leave.objects.filter(employee=employee).select_related('leave_type')
            except:
                return Leave.objects.none()
    
    def perform_create(self, serializer):
        leave = serializer.save(created_by=self.request.user)
        
        # Créer une entrée dans l'historique
        LeaveRequestHistory.objects.create(
            leave=leave,
            user=self.request.user,
            action='created',
            new_status='pending'
        )


class LeaveDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une demande de congé"""
    queryset = Leave.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return LeaveDetailSerializer
        elif self.request.method in ['PUT', 'PATCH']:
            return LeaveUpdateSerializer
        return LeaveDetailSerializer
    
    def get_permissions(self):
        if self.request.method in ['DELETE']:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.IsAuthenticated()]
    
    def perform_update(self, serializer):
        old_status = self.get_object().status
        leave = serializer.save()
        
        # Créer une entrée dans l'historique
        LeaveRequestHistory.objects.create(
            leave=leave,
            user=self.request.user,
            action='updated',
            old_status=old_status,
            new_status=leave.status
        )


class LeaveApproveView(APIView):
    """Approuver ou refuser une demande de congé"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def post(self, request, pk):
        try:
            leave = Leave.objects.get(pk=pk)
        except Leave.DoesNotExist:
            return Response(
                {'error': 'Demande de congé non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = LeaveApproveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        action = serializer.validated_data['action']
        old_status = leave.status
        
        if action == 'approve':
            leave.approve(request.user)
            message = 'Demande de congé approuvée'
        else:
            rejection_reason = serializer.validated_data.get('rejection_reason', '')
            leave.reject(request.user, rejection_reason)
            message = 'Demande de congé refusée'
        
        # Créer une entrée dans l'historique
        LeaveRequestHistory.objects.create(
            leave=leave,
            user=request.user,
            action=action,
            old_status=old_status,
            new_status=leave.status,
            comment=rejection_reason if action == 'reject' else ''
        )
        
        return Response({
            'success': True,
            'message': message,
            'status': leave.status
        })


class LeaveByEmployeeView(generics.ListAPIView):
    """Liste des congés d'un employé spécifique"""
    serializer_class = LeaveListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        employee_id = self.kwargs.get('employee_id')
        year = self.request.query_params.get('year')
        
        queryset = Leave.objects.filter(employee_id=employee_id)
        
        if year:
            queryset = queryset.filter(start_date__year=year)
        
        return queryset.order_by('-start_date')


class PendingLeavesView(generics.ListAPIView):
    """Liste des congés en attente"""
    serializer_class = LeaveListSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_queryset(self):
        return Leave.objects.filter(status='pending').order_by('start_date')


class CurrentLeavesView(generics.ListAPIView):
    """Liste des congés en cours"""
    serializer_class = LeaveListSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_queryset(self):
        today = timezone.now().date()
        return Leave.objects.filter(
            start_date__lte=today,
            end_date__gte=today,
            status='approved'
        ).order_by('employee')


class UpcomingLeavesView(generics.ListAPIView):
    """Liste des congés à venir"""
    serializer_class = LeaveListSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_queryset(self):
        today = timezone.now().date()
        next_week = today + timedelta(days=7)
        
        return Leave.objects.filter(
            start_date__gte=today,
            start_date__lte=next_week,
            status='approved'
        ).order_by('start_date')


class LeaveCalendarView(APIView):
    """Vue calendrier des congés"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        # Premier et dernier jour du mois
        start_date = timezone.datetime(year, month, 1).date()
        if month == 12:
            end_date = timezone.datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = timezone.datetime(year, month + 1, 1).date() - timedelta(days=1)
        
        leaves = Leave.objects.filter(
            start_date__lte=end_date,
            end_date__gte=start_date,
            status='approved'
        ).select_related('employee__user', 'leave_type')
        
        calendar_data = []
        for leave in leaves:
            calendar_data.append({
                'id': leave.id,
                'title': f"{leave.employee.user.get_full_name()} - {leave.leave_type.name}",
                'start': leave.start_date.isoformat(),
                'end': (leave.end_date + timedelta(days=1)).isoformat(),
                'color': leave.leave_type.color,
                'employee': leave.employee.id,
                'employee_name': leave.employee.user.get_full_name(),
                'leave_type': leave.leave_type.name
            })
        
        return Response(calendar_data)


class LeaveSummaryView(APIView):
    """Résumé des congés pour l'utilisateur connecté"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            employee = request.user.employee_profile
        except:
            return Response(
                {'error': 'Profil employé non trouvé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        today = timezone.now().date()
        
        # Statistiques
        total_pending = Leave.objects.filter(
            employee=employee,
            status='pending'
        ).count()
        
        total_approved = Leave.objects.filter(
            employee=employee,
            status='approved'
        ).count()
        
        total_taken = Leave.objects.filter(
            employee=employee,
            status='approved',
            end_date__lt=today
        ).aggregate(total=Sum('duration_days'))['total'] or 0
        
        # Congés à venir
        upcoming = Leave.objects.filter(
            employee=employee,
            status='approved',
            start_date__gte=today
        ).order_by('start_date')[:5]
        
        upcoming_data = LeaveListSerializer(upcoming, many=True).data
        
        # Soldes
        balances = LeaveBalance.objects.filter(
            employee=employee,
            year=today.year
        ).select_related('leave_type')
        
        balances_data = LeaveBalanceSerializer(balances, many=True).data
        
        summary = {
            'total_pending': total_pending,
            'total_approved': total_approved,
            'total_taken': float(total_taken),
            'upcoming': upcoming_data,
            'balances': balances_data
        }
        
        serializer = LeaveSummarySerializer(summary)
        return Response(serializer.data)


# ==================== VUES POUR LEAVE PERIOD ====================

class LeavePeriodListCreateView(generics.ListCreateAPIView):
    """Liste et création des périodes de congés"""
    queryset = LeavePeriod.objects.all()
    serializer_class = LeavePeriodSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']


class LeavePeriodDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une période de congés"""
    queryset = LeavePeriod.objects.all()
    serializer_class = LeavePeriodSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]


# ==================== VUES POUR LEAVE HISTORY ====================

class LeaveHistoryView(generics.ListAPIView):
    """Historique d'une demande de congé"""
    serializer_class = LeaveHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        leave_id = self.kwargs.get('leave_id')
        return LeaveRequestHistory.objects.filter(leave_id=leave_id).order_by('-created_at')


# ==================== VUES POUR STATISTIQUES ====================

class LeaveStatisticsView(APIView):
    """Statistiques globales des congés"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        
        # Statistiques par mois
        monthly_stats = []
        for month in range(1, 13):
            leaves = Leave.objects.filter(
                start_date__year=year,
                start_date__month=month,
                status='approved'
            )
            monthly_stats.append({
                'month': month,
                'count': leaves.count(),
                'total_days': sum(leave.duration_days for leave in leaves)
            })
        
        # Statistiques par type
        type_stats = LeaveType.objects.annotate(
            total_requests=Count('leaves'),
            approved_requests=Count('leaves', filter=Q(leaves__status='approved'))
        ).values('name', 'total_requests', 'approved_requests')
        
        # Top demandeurs
        top_employees = Employee.objects.annotate(
            leave_count=Count('leaves'),
            total_days=Sum('leaves__duration_days')
        ).filter(leave_count__gt=0).order_by('-leave_count')[:10]
        
        top_data = []
        for emp in top_employees:
            top_data.append({
                'employee_id': emp.employee_id,
                'name': emp.user.get_full_name(),
                'leave_count': emp.leave_count,
                'total_days': float(emp.total_days or 0)
            })
        
        return Response({
            'year': year,
            'monthly_stats': monthly_stats,
            'by_type': type_stats,
            'top_employees': top_data
        })