# leaves/filters.py
import django_filters
from .models import Leave

class LeaveFilter(django_filters.FilterSet):
    start_date_from = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_to = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    end_date_from = django_filters.DateFilter(field_name='end_date', lookup_expr='gte')
    end_date_to = django_filters.DateFilter(field_name='end_date', lookup_expr='lte')
    min_duration = django_filters.NumberFilter(method='filter_min_duration')
    
    class Meta:
        model = Leave
        fields = ['employee', 'leave_type', 'status']
    
    def filter_min_duration(self, queryset, name, value):
        return [leave for leave in queryset if leave.duration_days >= value]