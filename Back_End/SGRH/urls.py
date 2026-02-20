# SGRH/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),  # Inclure les URLs des utilisateurs
    # ... autres apps si nécessaire
]