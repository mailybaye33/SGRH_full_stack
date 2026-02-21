# employees/models.py
from django.db import models
from django.contrib.auth import get_user_model
import datetime

User = get_user_model()

class Employee(models.Model):
    """Modèle pour les employés"""
    EMPLOYMENT_STATUS = [
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
        ('on_leave', 'En congé'),
        ('terminated', 'Licencié'),
    ]
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='employee_profile'
    )
    employee_id = models.CharField(max_length=20, unique=True, verbose_name="Matricule")
    
    # ForeignKey vers Department (dans l'app departments)
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='employees',
        verbose_name="Département"
    )
    
    position = models.CharField(max_length=100, verbose_name="Poste")
    hire_date = models.DateField(verbose_name="Date d'embauche")
    employment_status = models.CharField(
        max_length=20, 
        choices=EMPLOYMENT_STATUS, 
        default='active',
        verbose_name="Statut"
    )
    
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    address = models.TextField(blank=True, verbose_name="Adresse")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Date de naissance")
    
    emergency_contact_name = models.CharField(max_length=100, blank=True, verbose_name="Contact urgence")
    emergency_contact_phone = models.CharField(max_length=20, blank=True, verbose_name="Tél. urgence")
    
    profile_picture = models.ImageField(
        upload_to='profile_pics/', 
        null=True, 
        blank=True,
        verbose_name="Photo"
    )
    contract_file = models.FileField(
        upload_to='contracts/', 
        null=True, 
        blank=True,
        verbose_name="Contrat"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")
    
    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name() or self.user.username}"
    
    def save(self, *args, **kwargs):
        if not self.employee_id:
            last_employee = Employee.objects.order_by('-id').first()
            if last_employee and last_employee.employee_id:
                try:
                    last_id = int(last_employee.employee_id.split('-')[-1])
                    new_id = last_id + 1
                except (ValueError, IndexError):
                    new_id = 1
            else:
                new_id = 1
            self.employee_id = f"EMP-{new_id:05d}"
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-hire_date']
        verbose_name = 'Employé'
        verbose_name_plural = 'Employés'


class Notification(models.Model):
    """Modèle pour les notifications"""
    NOTIFICATION_TYPES = [
        ('info', 'Information'),
        ('success', 'Succès'),
        ('warning', 'Avertissement'),
        ('error', 'Erreur'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        verbose_name="Utilisateur"
    )
    title = models.CharField(max_length=200, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    notification_type = models.CharField(
        max_length=20, 
        choices=NOTIFICATION_TYPES, 
        default='info',
        verbose_name="Type"
    )
    is_read = models.BooleanField(default=False, verbose_name="Lue")
    link = models.CharField(max_length=200, blank=True, null=True, verbose_name="Lien")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'