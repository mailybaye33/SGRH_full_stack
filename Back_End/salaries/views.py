from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from datetime import date

from .models import Salary
from .serializers import SalarySerializer
from .permissions import IsAdmin

from employees.models import Employee


class SalaryListCreateView(generics.ListCreateAPIView):

    serializer_class = SalarySerializer

    def get_queryset(self):

        user = self.request.user

        # admin voit tous les salaires
        if user.role == "ADMIN":
            return Salary.objects.all()

        # employé voit seulement son salaire
        return Salary.objects.filter(
            employee=user.employee
        )

    def get_permissions(self):

        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdmin()]

        return [IsAuthenticated()]


class SalaryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Salary.objects.all()
    serializer_class = SalarySerializer
    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]


# génération des salaires mensuels
class GenerateSalariesView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def post(self, request):

        today = date.today()

        month = today.month
        year = today.year

        employees = Employee.objects.all()

        for emp in employees:

            Salary.objects.create(
                employee=emp,
                month=month,
                year=year
            )

        return Response({
            "message": "Salaires générés avec succès"
        })