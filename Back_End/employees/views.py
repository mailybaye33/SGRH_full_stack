# employees/views.py
from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.utils import timezone
from datetime import date, timedelta
from .models import Employee, Notification
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer, 
    EmployeeCreateUpdateSerializer, NotificationSerializer
)
from django.contrib.auth import get_user_model
from users.permissions import IsAdminUser, IsManagerOrAdmin

User = get_user_model()


class EmployeeListCreateView(generics.ListCreateAPIView):
    """Liste et création des employés"""
    serializer_class = EmployeeListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'employment_status']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'position']
    ordering_fields = ['hire_date', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'MANAGER', 'HR']:
            return Employee.objects.select_related('user', 'department').all()
        else:
            try:
                return Employee.objects.filter(user=user)
            except:
                return Employee.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EmployeeCreateUpdateSerializer
        return EmployeeListSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.IsAuthenticated()]


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un employé"""
    queryset = Employee.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EmployeeDetailSerializer
        return EmployeeCreateUpdateSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.IsAuthenticated()]


class EmployeeByUserView(generics.RetrieveAPIView):
    """Récupérer un employé par son user_id"""
    serializer_class = EmployeeDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs.get('user_id')
        return Employee.objects.get(user_id=user_id)


class NotificationListCreateView(generics.ListCreateAPIView):
    """Liste et création des notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une notification"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    """Marquer une notification comme lue"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'Notification marquée comme lue'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification non trouvée'}, status=status.HTTP_404_NOT_FOUND)


class MarkAllNotificationsReadView(APIView):
    """Marquer toutes les notifications comme lues"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'Toutes les notifications ont été marquées comme lues'})


class UnreadNotificationCountView(APIView):
    """Nombre de notifications non lues"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})


class DashboardView(APIView):
    """Tableau de bord avec statistiques"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = date.today()
        
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(employment_status='active').count()
        
        # Présences aujourd'hui (via app attendance)
        try:
            from attendance.models import Attendance
            present_today = Attendance.objects.filter(date=today, status='PRESENT').count()
            late_today = Attendance.objects.filter(date=today, status='LATE').count()
        except:
            present_today = 0
            late_today = 0
        
        # Congés (via app leaves)
        try:
            from leaves.models import Leave
            on_leave_today = Leave.objects.filter(
                start_date__lte=today,
                end_date__gte=today,
                status='approved'
            ).count()
            pending_leaves = Leave.objects.filter(status='pending').count()
        except:
            on_leave_today = 0
            pending_leaves = 0
        
        data = {
            'total_employees': total_employees,
            'active_employees': active_employees,
            'present_today': present_today,
            'late_today': late_today,
            'on_leave_today': on_leave_today,
            'pending_leaves': pending_leaves,
        }
        
        return Response(data)


class RecentActivitiesView(APIView):
    """Activités récentes"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get(self, request):
        recent_activities = []
        
        # Derniers employés
        recent_employees = Employee.objects.order_by('-created_at')[:5]
        for emp in recent_employees:
            recent_activities.append({
                'type': 'new_employee',
                'title': 'Nouvel employé',
                'description': f"{emp.user.get_full_name()} a été ajouté",
                'date': emp.created_at
            })
        
        # Dernières notifications
        recent_notifications = Notification.objects.order_by('-created_at')[:5]
        for notif in recent_notifications:
            recent_activities.append({
                'type': 'notification',
                'title': notif.title,
                'description': notif.message[:50],
                'date': notif.created_at
            })
        
        recent_activities.sort(key=lambda x: x['date'], reverse=True)
        return Response(recent_activities[:10])