from django.urls import path
from .views import *

urlpatterns = [

    path(
        "",
        EmployeeListCreateView.as_view()
    ),

    path(
        "<int:pk>/",
        EmployeeDetailView.as_view()
    ),

]