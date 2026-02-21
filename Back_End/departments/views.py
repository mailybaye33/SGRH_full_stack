# departments/views.py
from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Department
from .serializers import DepartmentSerializer, DepartmentListSerializer, DepartmentDetailSerializer
from users.permissions import IsAdminUser, IsManagerOrAdmin

class DepartmentListCreateView(generics.ListCreateAPIView):
    """Liste et création des départements"""
    queryset = Department.objects.annotate(
        employee_count=Count('employees')
    ).all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['parent_department']
    search_fields = ['name', 'code', 'description', 'location']
    ordering_fields = ['name', 'created_at', 'employee_count']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DepartmentListSerializer
        return DepartmentSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'un département"""
    queryset = Department.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return DepartmentDetailSerializer
        return DepartmentSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.IsAuthenticated()]


class DepartmentHierarchyView(generics.ListAPIView):
    """Hiérarchie des départements (uniquement les parents)"""
    serializer_class = DepartmentListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Department.objects.filter(parent_department__isnull=True).annotate(
            employee_count=Count('employees')
        )


class DepartmentStatisticsView(APIView):
    """Statistiques sur les départements"""
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    
    def get(self, request):
        departments = Department.objects.annotate(
            emp_count=Count('employees'),
            avg_salary=Avg('employees__user__employee_profile__current_salary__base_salary')
        ).values('id', 'name', 'emp_count', 'avg_salary')
        
        total_employees = sum(d['emp_count'] for d in departments)
        
        return Response({
            'total_departments': departments.count(),
            'total_employees': total_employees,
            'departments': departments
        })