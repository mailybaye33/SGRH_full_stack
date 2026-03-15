from django.urls import path
from .views import *

urlpatterns = [

    path(
        "",
        SalaryListCreateView.as_view()
    ),

    path(
        "<int:pk>/",
        SalaryDetailView.as_view()
    ),

    path(
        "generate/",
        GenerateSalariesView.as_view()
    ),

]