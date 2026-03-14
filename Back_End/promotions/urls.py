from django.urls import path
from .views import *

urlpatterns = [

    path(
        "",
        PromotionListCreateView.as_view()
    ),

    path(
        "<int:pk>/",
        PromotionDetailView.as_view()
    ),

    path(
        "<int:promotion_id>/employees/",
        PromotionEmployeesView.as_view()
    ),

]