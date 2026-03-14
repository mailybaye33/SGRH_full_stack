from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Leave
from .serializers import LeaveSerializer


class LeaveListCreateView(generics.ListCreateAPIView):

    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # ADMIN voit tous les congés
        if user.role == "ADMIN":
            return Leave.objects.all()

        # EMPLOYEE voit seulement ses congés
        return Leave.objects.filter(
            employee=user.employee
        )
    
    def perform_create(self, serializer):

        serializer.save(employee=self.request.user.employee)


class LeaveDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == "ADMIN":
            return Leave.objects.all()

        return Leave.objects.filter(
            employee=user.employee
        )