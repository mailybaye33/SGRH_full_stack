# promotions/models.py
from django.db import models
from django.utils import timezone
from employees.models import Employee
from users.models import User

class PromotionType(models.Model):
    """Type de promotion"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default="fa-solid fa-arrow-up")
    color = models.CharField(max_length=20, default="#27ae60")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Type de promotion"
        verbose_name_plural = "Types de promotion"
        ordering = ['name']


class Promotion(models.Model):
    """Promotion d'un employé"""
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Refusé'),
        ('implemented', 'Implémenté'),
        ('cancelled', 'Annulé'),
    ]
    
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='promotions'
    )
    promotion_type = models.ForeignKey(
        PromotionType, 
        on_delete=models.PROTECT,
        related_name='promotions'
    )
    
    # Ancien poste
    old_position = models.CharField(max_length=100)
    old_department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        null=True,
        related_name='old_promotions'
    )
    old_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    old_grade = models.CharField(max_length=50, blank=True)
    
    # Nouveau poste
    new_position = models.CharField(max_length=100)
    new_department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        null=True,
        related_name='new_promotions'
    )
    new_salary = models.DecimalField(max_digits=10, decimal_places=2)
    new_grade = models.CharField(max_length=50, blank=True)
    
    # Détails
    promotion_date = models.DateField()
    effective_date = models.DateField()
    reason = models.TextField()
    comments = models.TextField(blank=True)
    
    # Augmentation
    salary_increase = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_increase_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Approbation
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_promotions'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Documents
    document = models.FileField(upload_to='promotions/', null=True, blank=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_promotions'
    )
    
    class Meta:
        verbose_name = "Promotion"
        verbose_name_plural = "Promotions"
        ordering = ['-promotion_date']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['promotion_date']),
        ]
    
    def __str__(self):
        return f"{self.employee} - {self.old_position} → {self.new_position} ({self.promotion_date})"
    
    def save(self, *args, **kwargs):
        # Calculer l'augmentation
        if self.old_salary and self.new_salary:
            self.salary_increase = self.new_salary - self.old_salary
            if self.old_salary > 0:
                self.salary_increase_percentage = (self.salary_increase / self.old_salary) * 100
        super().save(*args, **kwargs)
    
    def approve(self, user):
        self.status = 'approved'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save()
    
    def reject(self, user, reason):
        self.status = 'rejected'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.rejection_reason = reason
        self.save()
    
    def implement(self):
        """Implémenter la promotion (mettre à jour l'employé)"""
        self.status = 'implemented'
        self.employee.position = self.new_position
        self.employee.department = self.new_department
        self.employee.save()
        self.save()


class PromotionHistory(models.Model):
    """Historique des promotions"""
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)
    old_status = models.CharField(max_length=20, null=True, blank=True)
    new_status = models.CharField(max_length=20, null=True, blank=True)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Historique de promotion"
        verbose_name_plural = "Historiques de promotion"
        ordering = ['-created_at']


class CareerPath(models.Model):
    """Chemin de carrière type"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    levels = models.JSONField(default=list, help_text="Liste des niveaux de carrière")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Chemin de carrière"
        verbose_name_plural = "Chemins de carrière"