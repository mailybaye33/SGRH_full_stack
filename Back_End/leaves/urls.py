from django.urls import path
from .views import *

urlpatterns = [

    path(
        "",
        LeaveListCreateView.as_view()
    ),

    path(
        "<int:pk>/",
        LeaveDetailView.as_view()
    ),

]