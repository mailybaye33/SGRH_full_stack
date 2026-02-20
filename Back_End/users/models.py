# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def create_user(self, username, num_phone, password=None, **extra_fields):
        if not username:
            raise ValueError('Le nom d\'utilisateur est obligatoire')
        if not num_phone:
            raise ValueError('Le numéro de téléphone est obligatoire')
        
       
        
        user = self.model(
            username=username,
            num_phone=num_phone,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, num_phone, password=None, **extra_fields):
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(username, num_phone, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('ADMIN', 'Administrateur'),
        ('EMPLOYEE', 'Employé'),
    ]
    
    username = models.CharField(max_length=150, unique=True)
    num_phone = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='EMPLOYEE')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['num_phone']
    
    def __str__(self):
        return f"{self.username} ({self.num_phone})"
    
    def has_perm(self, perm, obj=None):
        return self.is_superuser or self.role == 'ADMIN'
    
    def has_module_perms(self, app_label):
        return self.is_superuser or self.role == 'ADMIN'
    
    class Meta:
        verbose_name = _("Utilisateur")
        verbose_name_plural = _("Utilisateurs")