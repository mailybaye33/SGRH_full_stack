from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated

from .models import Employee
from .serializers import EmployeeSerializer
from .permissions import IsAdmin


class EmployeeListCreateView(generics.ListCreateAPIView):

    queryset = Employee.objects.all()

    serializer_class = EmployeeSerializer

    permission_classes = [IsAuthenticated]

    filter_backends = [filters.SearchFilter]

    search_fields = [
        "first_name",
        "last_name",
        "email"
    ]


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Employee.objects.select_related("department", "promotion").order_by("id")

    serializer_class = EmployeeSerializer

    permission_classes = [IsAuthenticated, IsAdmin]