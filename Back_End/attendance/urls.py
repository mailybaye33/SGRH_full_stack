# attendance/urls.py

from django.urls import path
from .views import *

urlpatterns = [

    path(
        "",
        AttendanceListCreateView.as_view()
    ),

    path(
        "<int:pk>/",
        AttendanceDetailView.as_view()
    ),
    path("check-in/", CheckInView.as_view()),

    path("check-out/", CheckOutView.as_view()),

]