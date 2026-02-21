# departments/urls.py
from django.urls import path
from . import views

app_name = 'departments'

urlpatterns = [
    path('', views.DepartmentListCreateView.as_view(), name='department-list'),
    path('<int:pk>/', views.DepartmentDetailView.as_view(), name='department-detail'),
    path('hierarchy/', views.DepartmentHierarchyView.as_view(), name='department-hierarchy'),
    path('statistics/', views.DepartmentStatisticsView.as_view(), name='department-statistics'),
]