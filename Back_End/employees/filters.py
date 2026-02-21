# employees/filters.py
import django_filters
from .models import Attendance, Employee, Leave

class AttendanceFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    
    class Meta:
        model = Attendance
        fields = ['employee', 'status', 'date']