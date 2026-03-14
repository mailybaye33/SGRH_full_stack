from django.urls import path
from .views import *

urlpatterns = [

    path(
        '',
        DepartmentListCreateView.as_view()
    ),

    path(
        '<int:pk>/',
        DepartmentDetailView.as_view()
    ),

    path(
        '<int:department_id>/employees/',
        DepartmentEmployeesView.as_view()
    ),

]