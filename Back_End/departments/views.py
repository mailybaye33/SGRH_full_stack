from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Department
from .serializers import DepartmentSerializer
from .permissions import IsAdmin


# Liste + création
class DepartmentListCreateView(generics.ListCreateAPIView):

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


# Modifier / supprimer
class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


from rest_framework.views import APIView
from rest_framework.response import Response
from employees.models import Employee
from employees.serializers import EmployeeSerializer


class DepartmentEmployeesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, department_id):

        employees = Employee.objects.filter(
            department_id=department_id
        )

        serializer = EmployeeSerializer(
            employees,
            many=True
        )

        return Response(serializer.data)