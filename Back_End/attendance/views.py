from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q
from datetime import datetime, timedelta
from .models import Attendance, AttendanceSettings
from .serializers import AttendanceSerializer, CheckInSerializer, CheckOutSerializer
from users.permissions import IsAdminUser
from employees.models import Employee

class AttendanceListCreateView(generics.ListCreateAPIView):
    """Liste et création des pointages"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'date', 'status']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']
    ordering_fields = ['date', 'check_in', 'check_out']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.is_superuser:
            return Attendance.objects.select_related('employee__user', 'employee__department').all()
        else:
            try:
                employee = user.employee_profile
                return Attendance.objects.filter(employee=employee).select_related('employee')
            except Employee.DoesNotExist:
                return Attendance.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'ADMIN' and not self.request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les administrateurs peuvent créer des pointages manuellement")
        serializer.save()

class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un pointage"""
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.is_superuser:
            return Attendance.objects.all()
        else:
            try:
                employee = user.employee_profile
                return Attendance.objects.filter(employee=employee)
            except Employee.DoesNotExist:
                return Attendance.objects.none()
    
    def perform_update(self, serializer):
        if self.request.user.role != 'ADMIN' and not self.request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les administrateurs peuvent modifier les pointages")
        serializer.save()
    
    def perform_destroy(self, instance):
        if self.request.user.role != 'ADMIN' and not self.request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les administrateurs peuvent supprimer les pointages")
        instance.delete()

class CheckInView(APIView):
    """Pointage d'entrée"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Profil employé non trouvé'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        today = timezone.now().date()
        now = timezone.now()
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
            if attendance.check_in:
                return Response(
                    {'error': f'Vous avez déjà pointé aujourd\'hui à {attendance.check_in.strftime("%H:%M")}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Attendance.DoesNotExist:
            attendance = Attendance(employee=employee, date=today)
        
        attendance.check_in = now
        
        serializer = CheckInSerializer(data=request.data)
        if serializer.is_valid():
            attendance.check_in_latitude = serializer.validated_data.get('latitude')
            attendance.check_in_longitude = serializer.validated_data.get('longitude')
        
        if now.hour >= 9 and now.minute > 0:
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
        except Employee.DoesNotExist:
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
            return Response(
                {'error': f'Vous avez déjà pointé votre sortie à {attendance.check_out.strftime("%H:%M")}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance.check_out = timezone.now()
        
        serializer = CheckOutSerializer(data=request.data)
        if serializer.is_valid():
            attendance.check_out_latitude = serializer.validated_data.get('latitude')
            attendance.check_out_longitude = serializer.validated_data.get('longitude')
        
        attendance.calculate_hours()
        attendance.save()
        
        return Response({
            'success': True,
            'message': 'Pointage de sortie enregistré',
            'check_in': attendance.check_in,
            'check_out': attendance.check_out,
            'hours_worked': float(attendance.hours_worked),
            'overtime': float(attendance.overtime),
            'status': attendance.status
        })

class TodayAttendanceView(APIView):
    """Pointage du jour pour l'utilisateur connecté"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
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
        except Employee.DoesNotExist:
            return Attendance.objects.none()

class EmployeeAttendanceView(generics.ListAPIView):
    """Historique des pointages d'un employé spécifique (admin)"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        employee_id = self.kwargs.get('employee_id')
        return Attendance.objects.filter(
            employee_id=employee_id
        ).select_related('employee').order_by('-date')

class MonthlyAttendanceStatsView(APIView):
    """Statistiques mensuelles de présence"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        attendances = Attendance.objects.filter(
            date__year=year, 
            date__month=month
        ).select_related('employee', 'employee__department')
        
        total_employees = Employee.objects.filter(status='ACTIVE').count()
        employees_with_attendance = attendances.values('employee').distinct().count()
        
        total_hours = attendances.aggregate(Sum('hours_worked'))['hours_worked__sum'] or 0
        total_overtime = attendances.aggregate(Sum('overtime'))['overtime__sum'] or 0
        avg_hours = attendances.aggregate(Avg('hours_worked'))['hours_worked__avg'] or 0
        
        by_status = attendances.values('status').annotate(
            count=Count('id'),
            total_hours=Sum('hours_worked')
        )
        
        daily_stats = attendances.values('date').annotate(
            present=Count('id'),
            total_hours=Sum('hours_worked'),
            late=Count('id', filter=Q(status='LATE'))
        ).order_by('date')
        
        return Response({
            'period': f"{year}-{month:02d}",
            'statistiques': {
                'total_employees': total_employees,
                'employees_with_attendance': employees_with_attendance,
                'attendance_rate': (employees_with_attendance / total_employees * 100) if total_employees > 0 else 0,
                'total_hours': float(total_hours),
                'total_overtime': float(total_overtime),
                'average_hours_per_day': float(avg_hours),
                'total_records': attendances.count(),
            },
            'by_status': list(by_status),
            'daily_stats': list(daily_stats)
        })

class AttendanceSettingsView(APIView):
    """Gestion des paramètres de pointage"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        settings, created = AttendanceSettings.objects.get_or_create(id=1)
        return Response({
            'check_in_start': settings.check_in_start.strftime('%H:%M') if settings.check_in_start else '09:00',
            'check_in_end': settings.check_in_end.strftime('%H:%M') if settings.check_in_end else '09:30',
            'check_out_start': settings.check_out_start.strftime('%H:%M') if settings.check_out_start else '17:00',
            'check_out_end': settings.check_out_end.strftime('%H:%M') if settings.check_out_end else '19:00',
            'work_hours_per_day': float(settings.work_hours_per_day),
            'enable_geolocation': settings.enable_geolocation,
            'enable_photo': settings.enable_photo
        })
    
    def post(self, request):
        settings, created = AttendanceSettings.objects.get_or_create(id=1)
        
        if 'check_in_start' in request.data:
            settings.check_in_start = request.data['check_in_start']
        if 'check_in_end' in request.data:
            settings.check_in_end = request.data['check_in_end']
        if 'check_out_start' in request.data:
            settings.check_out_start = request.data['check_out_start']
        if 'check_out_end' in request.data:
            settings.check_out_end = request.data['check_out_end']
        if 'work_hours_per_day' in request.data:
            settings.work_hours_per_day = request.data['work_hours_per_day']
        if 'enable_geolocation' in request.data:
            settings.enable_geolocation = request.data['enable_geolocation']
        if 'enable_photo' in request.data:
            settings.enable_photo = request.data['enable_photo']
        
        settings.save()
        
        return Response({'success': True, 'message': 'Paramètres mis à jour'})