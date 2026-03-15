from django.urls import path
from .views import *

urlpatterns = [

    path("", UserListView.as_view()),

    path("<int:pk>/", UserDetailView.as_view()),

    path("register/", RegisterView.as_view()),

    path("login/", LoginAPIView.as_view()),

    path("me/", CurrentUserView.as_view()),

]