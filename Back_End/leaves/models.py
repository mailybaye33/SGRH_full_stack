# leaves/models.py (suite)
from django.db import models
from django.utils import timezone
from employees.models import Employee
from users.models import User

class LeaveType(models.Model):
    """Type de congé"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    default_days = models.IntegerField(default=0)
    is_paid = models.BooleanField(default=True)
    requires_approval = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    color = models.CharField(max_length=20, default="#3498db")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Type de congé"
        verbose_name_plural = "Types de congé"
        ordering = ['name']


class LeaveBalance(models.Model):
    """Solde de congés par employé"""
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='leave_balances'
    )
    leave_type = models.ForeignKey(
        LeaveType, 
        on_delete=models.CASCADE,
        related_name='balances'
    )
    year = models.IntegerField(default=timezone.now().year)
    total_days = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    used_days = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pending_days = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    remaining_days = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Solde de congé"
        verbose_name_plural = "Soldes de congés"
        unique_together = ['employee', 'leave_type', 'year']
    
    def __str__(self):
        return f"{self.employee} - {self.leave_type} - {self.year}: {self.remaining_days} jours"
    
    def save(self, *args, **kwargs):
        self.remaining_days = self.total_days - self.used_days - self.pending_days
        super().save(*args, **kwargs)


class Leave(models.Model):
    """Demande de congé"""
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Refusé'),
        ('cancelled', 'Annulé'),
        ('in_progress', 'En cours'),
        ('taken', 'Pris'),
    ]
    
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='leaves'
    )
    leave_type = models.ForeignKey(
        LeaveType, 
        on_delete=models.PROTECT,
        related_name='leaves'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    start_half_day = models.BooleanField(default=False, help_text="Demi-journée le premier jour")
    end_half_day = models.BooleanField(default=False, help_text="Demi-journée le dernier jour")
    
    reason = models.TextField()
    comments = models.TextField(blank=True, help_text="Commentaires supplémentaires")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Approbation
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_leaves'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Documents
    attachment = models.FileField(upload_to='leaves/', null=True, blank=True)
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_leaves'
    )
    
    class Meta:
        verbose_name = "Demande de congé"
        verbose_name_plural = "Demandes de congés"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.start_date} - {self.end_date})"
    
    @property
    def duration_days(self):
        """Calcule le nombre de jours de congé"""
        delta = (self.end_date - self.start_date).days + 1
        
        # Ajuster pour les demi-journées
        if self.start_half_day:
            delta -= 0.5
        if self.end_half_day:
            delta -= 0.5
            
        return delta
    
    @property
    def is_current(self):
        """Vérifie si le congé est en cours"""
        today = timezone.now().date()
        return self.start_date <= today <= self.end_date
    
    @property
    def is_past(self):
        """Vérifie si le congé est passé"""
        return self.end_date < timezone.now().date()
    
    @property
    def is_upcoming(self):
        """Vérifie si le congé est à venir"""
        return self.start_date > timezone.now().date()
    
    def approve(self, user):
        """Approuver la demande"""
        self.status = 'approved'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save()
        
        # Mettre à jour le solde
        self.update_balance()
    
    def reject(self, user, reason):
        """Refuser la demande"""
        self.status = 'rejected'
        self.approved_by = user
        self.approved_at = timezone.now()
        self.rejection_reason = reason
        self.save()
    
    def cancel(self):
        """Annuler la demande"""
        self.status = 'cancelled'
        self.save()
    
    def update_balance(self):
        """Met à jour le solde de congés"""
        try:
            balance = LeaveBalance.objects.get(
                employee=self.employee,
                leave_type=self.leave_type,
                year=self.start_date.year
            )
            if self.status == 'approved':
                balance.used_days += self.duration_days
            elif self.status == 'pending':
                balance.pending_days += self.duration_days
            elif self.status == 'cancelled' or self.status == 'rejected':
                balance.pending_days -= self.duration_days
            balance.save()
        except LeaveBalance.DoesNotExist:
            # Créer un solde si nécessaire
            pass


class LeavePeriod(models.Model):
    """Période de congés (ex: été, Noël)"""
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.start_date} - {self.end_date})"
    
    class Meta:
        verbose_name = "Période de congés"
        verbose_name_plural = "Périodes de congés"
        ordering = ['start_date']


class LeaveRequestHistory(models.Model):
    """Historique des modifications des demandes de congé"""
    leave = models.ForeignKey(Leave, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)
    old_status = models.CharField(max_length=20, null=True, blank=True)
    new_status = models.CharField(max_length=20, null=True, blank=True)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Historique de congé"
        verbose_name_plural = "Historiques de congés"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.leave} - {self.action} - {self.created_at}"