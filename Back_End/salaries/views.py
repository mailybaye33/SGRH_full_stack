from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Salary
from .serializers import SalarySerializer
from .permissions import IsAdmin


class SalaryListCreateView(generics.ListCreateAPIView):

    serializer_class = SalarySerializer

    def get_queryset(self):

        user = self.request.user

        # ADMIN voit tous les salaires
        if user.role == "ADMIN":
            return Salary.objects.all()

        # EMPLOYE voit seulement son salaire
        return Salary.objects.filter(
            employee=user.employee
        )

    def get_permissions(self):

        # création salaire = admin seulement
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