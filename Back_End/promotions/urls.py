# promotions/urls.py
from django.urls import path
from . import views

app_name = 'promotions'

urlpatterns = [
    # Promotion Types
    path('types/', views.PromotionTypeListCreateView.as_view(), name='promotion-type-list'),
    path('types/<int:pk>/', views.PromotionTypeDetailView.as_view(), name='promotion-type-detail'),
    
    # Promotions
    path('', views.PromotionListCreateView.as_view(), name='promotion-list'),
    path('<int:pk>/', views.PromotionDetailView.as_view(), name='promotion-detail'),
    path('<int:pk>/approve/', views.PromotionApproveView.as_view(), name='promotion-approve'),
    path('employee/<int:employee_id>/', views.PromotionByEmployeeView.as_view(), name='promotion-by-employee'),
    path('pending/', views.PendingPromotionsView.as_view(), name='pending-promotions'),
    path('recent/', views.RecentPromotionsView.as_view(), name='recent-promotions'),
    
    # History
    path('<int:promotion_id>/history/', views.PromotionHistoryView.as_view(), name='promotion-history'),
    
    # Career Paths
    path('career-paths/', views.CareerPathListCreateView.as_view(), name='career-path-list'),
    path('career-paths/<int:pk>/', views.CareerPathDetailView.as_view(), name='career-path-detail'),
    path('career-paths/employee/<int:employee_id>/', views.EmployeeCareerPathView.as_view(), name='employee-career-path'),
    
    # Statistics
    path('statistics/', views.PromotionStatisticsView.as_view(), name='promotion-statistics'),
]