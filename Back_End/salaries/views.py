# salaries/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Sum, Min, Max, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    SalaryGrade, EmployeeSalary, SalaryHistory, 
    Payroll, PayrollBatch, SalaryAdvance
)
from .serializers import (
    SalaryGradeSerializer, EmployeeSalarySerializer, EmployeeSalaryCreateSerializer,
    SalaryHistorySerializer, PayrollListSerializer, PayrollDetailSerializer,
    PayrollCreateSerializer, PayrollUpdateSerializer, PayrollValidateSerializer,
    PayrollBatchSerializer, PayrollBatchCreateSerializer,
    SalaryAdvanceSerializer, SalaryAdvanceCreateSerializer, SalaryAdvanceApproveSerializer,
    SalaryStatisticsSerializer
)
from employees.models import Employee
from users.permissions import IsAdminUser, IsManagerOrAdmin


# ==================== VUES POUR SALARY GRADE ====================

class SalaryGradeListCreateView(generics.ListCreateAPIView):
    """Liste et création des grilles salariales"""
    queryset = SalaryGrade.objects.all()
    serializer_class = SalaryGradeSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code', 'description']


class SalaryGradeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une grille salariale"""
    queryset = SalaryGrade.objects.all()
    serializer_class = SalaryGradeSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]


# ==================== VUES POUR EMPLOYEE SALARY ====================

class EmployeeSalaryListCreateView(generics.ListCreateAPIView):
    """Liste et création des salaires employés"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'grade', 'is_active', 'payment_method']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'bank_account']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EmployeeSalaryCreateSerializer
        return EmployeeSalarySerializer
    
    def get_queryset(self):
        return EmployeeSalary.objects.select_related(
            'employee__user', 'grade'
        ).all()
    
    def perform_create(self, serializer):
        salary = serializer.save(created_by=self.request.user)
        
        # Créer une entrée dans l'historique
        SalaryHistory.objects.create(
            employee=salary.employee,
            previous_salary=0,
            new_salary=salary.base_salary,
            change_amount=salary.base_salary,
            change_percentage=100,
            reason="Salaire initial",
            change_date=salary.effective_date,
            changed_by=self.request.user
        )


class EmployeeSalaryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un salaire employé"""
    queryset = EmployeeSalary.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EmployeeSalaryCreateSerializer
        return EmployeeSalarySerializer
    
    def perform_update(self, serializer):
        old_salary = self.get_object()
        new_salary = serializer.save()
        
        # Si le salaire de base a changé, enregistrer dans l'historique
        if old_salary.base_salary != new_salary.base_salary:
            change_amount = new_salary.base_salary - old_salary.base_salary
            change_percentage = (change_amount / old_salary.base_salary) * 100 if old_salary.base_salary > 0 else 0
            
            SalaryHistory.objects.create(
                employee=new_salary.employee,
                previous_salary=old_salary.base_salary,
                new_salary=new_salary.base_salary,
                change_amount=change_amount,
                change_percentage=change_percentage,
                reason="Mise à jour salariale",
                change_date=timezone.now().date(),
                changed_by=self.request.user
            )


class CurrentEmployeeSalaryView(generics.RetrieveAPIView):
    """Salaire actuel de l'employé connecté"""
    serializer_class = EmployeeSalarySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            employee = self.request.user.employee_profile
            return EmployeeSalary.objects.get(employee=employee, is_active=True)
        except:
            return None


class EmployeeSalaryHistoryView(generics.ListAPIView):
    """Historique des salaires d'un employé"""
    serializer_class = SalaryHistorySerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_queryset(self):
        employee_id = self.kwargs.get('employee_id')
        return SalaryHistory.objects.filter(employee_id=employee_id).order_by('-change_date')


# ==================== VUES POUR PAYROLL ====================

class PayrollListCreateView(generics.ListCreateAPIView):
    """Liste et création des fiches de paie"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['employee', 'month', 'year', 'status']
    search_fields = ['employee__user__first_name', 'employee__user__last_name']
    ordering_fields = ['year', 'month', 'created_at']
    ordering = ['-year', '-month']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PayrollCreateSerializer
        return PayrollListSerializer
    
    def get_queryset(self):
        return Payroll.objects.select_related('employee__user').all()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PayrollDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une fiche de paie"""
    queryset = Payroll.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PayrollDetailSerializer
        elif self.request.method in ['PUT', 'PATCH']:
            return PayrollUpdateSerializer
        return PayrollDetailSerializer


class PayrollValidateView(APIView):
    """Valider, payer ou annuler une fiche de paie"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def post(self, request, pk):
        try:
            payroll = Payroll.objects.get(pk=pk)
        except Payroll.DoesNotExist:
            return Response(
                {'error': 'Fiche de paie non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PayrollValidateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        action = serializer.validated_data['action']
        
        if action == 'validate':
            payroll.validate(request.user)
            message = 'Fiche de paie validée'
        elif action == 'pay':
            payment_date = serializer.validated_data.get('payment_date')
            payroll.mark_as_paid(payment_date)
            message = 'Fiche de paie marquée comme payée'
        elif action == 'cancel':
            payroll.status = 'cancelled'
            payroll.save()
            message = 'Fiche de paie annulée'
        
        return Response({
            'success': True,
            'message': message,
            'status': payroll.status
        })


class PayrollByEmployeeView(generics.ListAPIView):
    """Fiches de paie d'un employé spécifique"""
    serializer_class = PayrollListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        employee_id = self.kwargs.get('employee_id')
        
        # Vérifier les permissions
        user = self.request.user
        is_admin = user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'MANAGER', 'HR']
        
        if is_admin:
            return Payroll.objects.filter(employee_id=employee_id).order_by('-year', '-month')
        else:
            try:
                employee = user.employee_profile
                if employee.id == int(employee_id):
                    return Payroll.objects.filter(employee=employee).order_by('-year', '-month')
            except:
                pass
            return Payroll.objects.none()


class MyPayrollsView(generics.ListAPIView):
    """Fiches de paie de l'utilisateur connecté"""
    serializer_class = PayrollListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            employee = self.request.user.employee_profile
            return Payroll.objects.filter(employee=employee).order_by('-year', '-month')
        except:
            return Payroll.objects.none()


class PendingPayrollsView(generics.ListAPIView):
    """Fiches de paie en attente"""
    serializer_class = PayrollListSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get_queryset(self):
        return Payroll.objects.filter(status='draft').order_by('-year', '-month')


# ==================== VUES POUR PAYROLL BATCH ====================

class PayrollBatchListCreateView(generics.ListCreateAPIView):
    """Liste et création des lots de paie"""
    queryset = PayrollBatch.objects.all()
    serializer_class = PayrollBatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['month', 'year', 'status']


class PayrollBatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un lot de paie"""
    queryset = PayrollBatch.objects.all()
    serializer_class = PayrollBatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]


class PayrollBatchCreateFromEmployeesView(APIView):
    """Créer un lot de paie à partir d'une liste d'employés"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def post(self, request):
        serializer = PayrollBatchCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        month = serializer.validated_data['month']
        year = serializer.validated_data['year']
        employee_ids = serializer.validated_data['employee_ids']
        name = serializer.validated_data.get('name', f"Paie {month}/{year}")
        
        # Vérifier si un lot existe déjà
        batch, created = PayrollBatch.objects.get_or_create(
            month=month,
            year=year,
            defaults={'name': name, 'created_by': request.user}
        )
        
        # Créer les fiches de paie pour chaque employé
        payrolls_created = []
        for emp_id in employee_ids:
            try:
                employee = Employee.objects.get(id=emp_id)
                
                # Vérifier si une fiche existe déjà
                payroll, payroll_created = Payroll.objects.get_or_create(
                    employee=employee,
                    month=month,
                    year=year,
                    defaults={
                        'base_salary': employee.current_salary.base_salary if hasattr(employee, 'current_salary') else 0,
                        'created_by': request.user
                    }
                )
                
                if payroll_created:
                    batch.payrolls.add(payroll)
                    payrolls_created.append(payroll.id)
                    
            except Employee.DoesNotExist:
                continue
        
        batch.calculate_totals()
        
        return Response({
            'success': True,
            'batch_id': batch.id,
            'payrolls_created': len(payrolls_created),
            'total_payrolls': batch.count,
            'total_amount': float(batch.total_amount)
        })


class PayrollBatchProcessView(APIView):
    """Traiter un lot de paie"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def post(self, request, pk):
        try:
            batch = PayrollBatch.objects.get(pk=pk)
        except PayrollBatch.DoesNotExist:
            return Response(
                {'error': 'Lot de paie non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Valider toutes les fiches du lot
        for payroll in batch.payrolls.filter(status='draft'):
            payroll.validate(request.user)
        
        batch.status = 'validated'
        batch.processed_at = timezone.now()
        batch.processed_by = request.user
        batch.save()
        
        return Response({
            'success': True,
            'message': f"Lot {batch.name} traité avec succès",
            'total_payrolls': batch.count,
            'total_amount': float(batch.total_amount)
        })


# ==================== VUES POUR SALARY ADVANCE ====================

class SalaryAdvanceListCreateView(generics.ListCreateAPIView):
    """Liste et création des avances sur salaire"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'status']
    search_fields = ['employee__user__first_name', 'employee__user__last_name', 'reason']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SalaryAdvanceCreateSerializer
        return SalaryAdvanceSerializer
    
    def get_queryset(self):
        user = self.request.user
        is_admin = user.is_superuser or getattr(user, 'role', '') in ['ADMIN', 'MANAGER', 'HR']
        
        if is_admin:
            return SalaryAdvance.objects.select_related('employee__user').all()
        else:
            try:
                employee = user.employee_profile
                return SalaryAdvance.objects.filter(employee=employee)
            except:
                return SalaryAdvance.objects.none()
    
    def perform_create(self, serializer):
        serializer.save()


class SalaryAdvanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une avance sur salaire"""
    queryset = SalaryAdvance.objects.all()
    serializer_class = SalaryAdvanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.IsAuthenticated()]


class SalaryAdvanceApproveView(APIView):
    """Approuver, refuser ou payer une avance sur salaire"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def post(self, request, pk):
        try:
            advance = SalaryAdvance.objects.get(pk=pk)
        except SalaryAdvance.DoesNotExist:
            return Response(
                {'error': 'Avance sur salaire non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = SalaryAdvanceApproveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        action = serializer.validated_data['action']
        notes = serializer.validated_data.get('notes', '')
        
        if action == 'approve':
            advance.approve(request.user)
            message = 'Avance sur salaire approuvée'
        elif action == 'reject':
            advance.reject(request.user, notes)
            message = 'Avance sur salaire refusée'
        elif action == 'pay':
            advance.mark_as_paid()
            message = 'Avance sur salaire marquée comme payée'
        
        return Response({
            'success': True,
            'message': message,
            'status': advance.status
        })


class MySalaryAdvancesView(generics.ListAPIView):
    """Avances sur salaire de l'utilisateur connecté"""
    serializer_class = SalaryAdvanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        try:
            employee = self.request.user.employee_profile
            return SalaryAdvance.objects.filter(employee=employee).order_by('-request_date')
        except:
            return SalaryAdvance.objects.none()


# ==================== VUES POUR STATISTIQUES ====================

class SalaryStatisticsView(APIView):
    """Statistiques salariales"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get(self, request):
        year = int(request.query_params.get('year', timezone.now().year))
        
        # Statistiques globales
        payrolls = Payroll.objects.filter(year=year)
        
        total_payroll = payrolls.aggregate(total=Sum('net_salary'))['total'] or 0
        avg_salary = payrolls.aggregate(avg=Avg('net_salary'))['avg'] or 0
        min_salary = payrolls.aggregate(min=Min('net_salary'))['min'] or 0
        max_salary = payrolls.aggregate(max=Max('net_salary'))['max'] or 0
        total_employees = payrolls.values('employee').distinct().count()
        
        # Par département
        from departments.models import Department
        dept_stats = []
        for dept in Department.objects.all():
            dept_payrolls = payrolls.filter(employee__department=dept)
            dept_stats.append({
                'department': dept.name,
                'total': float(dept_payrolls.aggregate(total=Sum('net_salary'))['total'] or 0),
                'average': float(dept_payrolls.aggregate(avg=Avg('net_salary'))['avg'] or 0),
                'count': dept_payrolls.values('employee').distinct().count()
            })
        
        # Par grade
        grade_stats = []
        for grade in SalaryGrade.objects.all():
            grade_payrolls = payrolls.filter(employee__current_salary__grade=grade)
            grade_stats.append({
                'grade': grade.name,
                'average': float(grade_payrolls.aggregate(avg=Avg('net_salary'))['avg'] or 0),
                'count': grade_payrolls.values('employee').distinct().count()
            })
        
        # Évolution mensuelle
        monthly_stats = []
        for month in range(1, 13):
            month_payrolls = payrolls.filter(month=month)
            monthly_stats.append({
                'month': month,
                'total': float(month_payrolls.aggregate(total=Sum('net_salary'))['total'] or 0),
                'count': month_payrolls.count()
            })
        
        data = {
            'year': year,
            'total_payroll': float(total_payroll),
            'average_salary': float(avg_salary),
            'min_salary': float(min_salary),
            'max_salary': float(max_salary),
            'total_employees': total_employees,
            'by_department': dept_stats,
            'by_grade': grade_stats,
            'monthly_evolution': monthly_stats
        }
        
        serializer = SalaryStatisticsSerializer(data)
        return Response(serializer.data)


class EmployeeSalarySummaryView(APIView):
    """Résumé salarial pour un employé"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, employee_id):
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employé non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Salaire actuel
        current_salary = None
        try:
            current_salary = EmployeeSalary.objects.get(employee=employee, is_active=True)
        except EmployeeSalary.DoesNotExist:
            pass
        
        # Total des paies de l'année
        year = timezone.now().year
        yearly_payrolls = Payroll.objects.filter(
            employee=employee,
            year=year,
            status='paid'
        )
        
        total_year = yearly_payrolls.aggregate(total=Sum('net_salary'))['total'] or 0
        
        # Historique des augmentations
        salary_history = SalaryHistory.objects.filter(employee=employee).order_by('-change_date')[:5]
        
        # Avances en cours
        pending_advances = SalaryAdvance.objects.filter(
            employee=employee,
            status__in=['approved', 'paid']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'employee': employee.employee_id,
            'name': employee.user.get_full_name(),
            'current_salary': EmployeeSalarySerializer(current_salary).data if current_salary else None,
            'yearly_total': float(total_year),
            'pending_advances': float(pending_advances),
            'recent_history': SalaryHistorySerializer(salary_history, many=True).data
        })