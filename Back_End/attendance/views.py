# attendance/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q
from datetime import datetime, timedelta
from .models import Attendance, AttendanceSettings
from .serializers import (
    AttendanceSerializer, AttendanceCreateSerializer, CheckInSerializer,
    CheckOutSerializer, AttendanceStatsSerializer, AttendanceSettingsSerializer
)
from employees.models import Employee
from users.permissions import IsAdminUser, IsManagerOrAdmin

class AttendanceListCreateView(generics.ListCreateAPIView):
    """Liste et création des pointages"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'date', 'status']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'notes']
    ordering_fields = ['date', 'check_in', 'check_out']
    ordering = ['-date']
    
    def get_queryset(self):
        user = self.request.user
        is_admin = user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'MANAGER', 'HR']
        
        if is_admin:
            return Attendance.objects.select_related(
                'employee__user', 'employee__department'
            ).all()
        else:
            try:
                employee = user.employee_profile
                return Attendance.objects.filter(employee=employee).select_related('employee')
            except:
                return Attendance.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AttendanceCreateSerializer
        return AttendanceSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un pointage"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.IsAuthenticated()]

class CheckInView(APIView):
    """Pointage d'entrée"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            employee = request.user.employee_profile
        except:
            return Response(
                {'error': 'Profil employé non trouvé'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        today = timezone.now().date()
        now = timezone.now()
        
        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={'check_in': now}
        )
        
        if not created and attendance.check_in:
            return Response({
                'error': f'Vous avez déjà pointé aujourd\'hui à {attendance.check_in.strftime("%H:%M")}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        attendance.check_in = now
        
        # Géolocalisation optionnelle
        serializer = CheckInSerializer(data=request.data)
        if serializer.is_valid():
            attendance.check_in_latitude = serializer.validated_data.get('latitude')
            attendance.check_in_longitude = serializer.validated_data.get('longitude')
        
        # Déterminer le statut
        settings = AttendanceSettings.objects.first()
        if settings and now.time() > settings.check_in_end:
            attendance.status = 'LATE'
        else:
            attendance.status = 'PRESENT'
        
        attendance.save()
        
        return Response({
            'success': True,
            'message': 'Pointage d\'entrée enregistré',
            'check_in': attendance.check_in,
            'date': attendance.date,
            'status': attendance.status
        })

class CheckOutView(APIView):
    """Pointage de sortie"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            employee = request.user.employee_profile
        except:
            return Response(
                {'error': 'Profil employé non trouvé'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        today = timezone.now().date()
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response(
                {'error': 'Aucun pointage d\'entrée trouvé pour aujourd\'hui'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if attendance.check_out:
            return Response({
                'error': f'Vous avez déjà pointé votre sortie à {attendance.check_out.strftime("%H:%M")}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        attendance.check_out = timezone.now()
        
        # Géolocalisation
        serializer = CheckOutSerializer(data=request.data)
        if serializer.is_valid():
            attendance.check_out_latitude = serializer.validated_data.get('latitude')
            attendance.check_out_longitude = serializer.validated_data.get('longitude')
        
        attendance.save()
        
        return Response({
            'success': True,
            'message': 'Pointage de sortie enregistré',
            'check_in': attendance.check_in,
            'check_out': attendance.check_out,
            'hours_worked': float(attendance.hours_worked),
            'overtime': float(attendance.overtime)
        })

class TodayAttendanceView(APIView):
    """Pointage du jour pour l'utilisateur connecté"""
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
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data)
        except Attendance.DoesNotExist:
            return Response({
                'date': today,
                'has_check_in': False,
                'has_check_out': False,
                'message': 'Aucun pointage pour aujourd\'hui'
            })

class MyAttendanceHistoryView(generics.ListAPIView):
    """Historique des pointages de l'utilisateur connecté"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            employee = self.request.user.employee_profile
            start_date = self.request.query_params.get('start_date')
            end_date = self.request.query_params.get('end_date')
            
            queryset = Attendance.objects.filter(employee=employee)
            
            if start_date:
                queryset = queryset.filter(date__gte=start_date)
            if end_date:
                queryset = queryset.filter(date__lte=end_date)
            
            return queryset.order_by('-date')
        except:
            return Attendance.objects.none()

class EmployeeAttendanceView(generics.ListAPIView):
    """Historique des pointages d'un employé spécifique"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_queryset(self):
        employee_id = self.kwargs.get('employee_id')
        return Attendance.objects.filter(employee_id=employee_id).order_by('-date')

class MonthlyAttendanceStatsView(APIView):
    """Statistiques mensuelles de présence"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        attendances = Attendance.objects.filter(
            date__year=year,
            date__month=month
        )
        
        total_employees = Employee.objects.count()
        employees_with_attendance = attendances.values('employee').distinct().count()
        
        stats = {
            'period': f"{year}-{month:02d}",
            'total_records': attendances.count(),
            'employees_with_attendance': employees_with_attendance,
            'attendance_rate': (employees_with_attendance / total_employees * 100) if total_employees > 0 else 0,
            'total_hours': float(attendances.aggregate(Sum('hours_worked'))['hours_worked__sum'] or 0),
            'total_overtime': float(attendances.aggregate(Sum('overtime'))['overtime__sum'] or 0),
            'by_status': attendances.values('status').annotate(
                count=Count('id'),
                hours=Sum('hours_worked')
            )
        }
        
        return Response(stats)

class AttendanceSettingsView(generics.RetrieveUpdateAPIView):
    """Paramètres de pointage"""
    queryset = AttendanceSettings.objects.all()
    serializer_class = AttendanceSettingsSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_object(self):
        obj, created = AttendanceSettings.objects.get_or_create(id=1)
        return obj