from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Promotion
from .serializers import PromotionSerializer
from .permissions import IsAdmin

from employees.models import Employee
from employees.serializers import EmployeeSerializer


# ===============================
# LISTE DES PROMOTIONS
# ===============================

class PromotionListCreateView(
    generics.ListCreateAPIView
):

    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer

    def get_permissions(self):

        # création seulement admin
        if self.request.method == "POST":

            return [IsAuthenticated(), IsAdmin()]

        # lecture admin + employé
        return [IsAuthenticated()]


# ===============================
# MODIFIER / SUPPRIMER PROMOTION
# ===============================

class PromotionDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    # vérifier avant suppression
    def destroy(self, request, *args, **kwargs):

        promotion = self.get_object()

        # vérifier si des employés utilisent la promotion
        if Employee.objects.filter(
            promotion=promotion
        ).exists():

            raise ValidationError(
                "Impossible de supprimer cette promotion : elle est utilisée par des employés."
            )

        return super().destroy(
            request,
            *args,
            **kwargs
        )


# ===============================
# VOIR EMPLOYES D'UNE PROMOTION
# ===============================

class PromotionEmployeesView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get(self, request, promotion_id):

        employees = Employee.objects.filter(
            promotion_id=promotion_id
        )

        serializer = EmployeeSerializer(
            employees,
            many=True
        )

        return Response(serializer.data)