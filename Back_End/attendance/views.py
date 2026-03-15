from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics

from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceListCreateView(generics.ListCreateAPIView):

    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == "ADMIN":
            return Attendance.objects.all()

        return Attendance.objects.filter(employee=user.employee)

    def perform_create(self, serializer):

        user = self.request.user

        if user.role == "ADMIN":
            serializer.save()
        else:
            serializer.save(employee=user.employee)


class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == "ADMIN":
            return Attendance.objects.all()

        return Attendance.objects.filter(employee=user.employee)


# CHECK IN

class CheckInView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        employee = request.user.employee
        today = timezone.now().date()

        attendance = Attendance.objects.filter(
            employee=employee,
            date=today
        ).first()

        if attendance:
            return Response({
                "error": "Entrée déjà enregistrée"
            })

        attendance = Attendance.objects.create(
            employee=employee,
            date=today,
            check_in=timezone.now().time()
        )

        serializer = AttendanceSerializer(attendance)

        return Response(serializer.data)


# CHECK OUT

class CheckOutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        employee = request.user.employee
        today = timezone.now().date()

        attendance = Attendance.objects.filter(
            employee=employee,
            date=today
        ).first()

        if not attendance:
            return Response({
                "error": "Aucune entrée aujourd'hui"
            })

        if attendance.check_out:
            return Response({
                "error": "Sortie déjà enregistrée"
            })

        attendance.check_out = timezone.now().time()
        attendance.save()

        serializer = AttendanceSerializer(attendance)

        return Response(serializer.data)