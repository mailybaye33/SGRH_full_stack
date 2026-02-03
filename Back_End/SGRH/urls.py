from django.contrib import admin
from django.urls import path, include, re_path
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView
from django.shortcuts import redirect

urlpatterns = [
    # Admin Django (gardé pour l'administration)
    path('admin/', admin.site.urls),
    
    # Authentification Django (pour l'interface web)
    path('web/login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),
    path('web/logout/', auth_views.LogoutView.as_view(next_page='/web/login/'), name='logout'),
    
    # Interface web Django (tes vues existantes)
    path('web/users/', include('users.urls')),
    path('users/', include('users.urls')),  # Inclure les URLs des utilisateurs
    # API REST (pour React)
    path('api/auth/', include('rest_framework.urls')),  # API login/logout
    path('api/users/', include('users.api_urls')),      # API users
    path('api/employees/', include('employees.api_urls')),  # API employees
    
    # Application React (frontend principal)
    # Cette ligne sert l'application React pour toutes les autres routes
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

# Redirection racine vers React ou login selon l'authentification
def root_redirect(request):
    if request.user.is_authenticated:
        # Redirige vers React app
        return TemplateView.as_view(template_name='index.html')(request)
    else:
        # Redirige vers login React ou Django selon le besoin
        return TemplateView.as_view(template_name='index.html')(request)

urlpatterns.insert(0, path('', root_redirect))