from django.contrib import admin
from django.urls import path, include

urlpatterns = [

    path('admin/', admin.site.urls),

    path('api/departments/', include('departments.urls')),
    path('api/promotions/', include('promotions.urls')),
    path('api/employees/', include('employees.urls')),
    path('api/users/', include('users.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/salaries/', include('salaries.urls')),
    path('api/leaves/', include('leaves.urls')),

]