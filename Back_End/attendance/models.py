# attendance/models.py
from django.db import models
from django.utils import timezone
from employees.models import Employee

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Présent'),
        ('ABSENT', 'Absent'),
        ('LATE', 'En retard'),
        ('HALF_DAY', 'Demi-journée'),
        ('MISSION', 'En mission'),
        ('REMOTE', 'Télétravail'),
        ('HOLIDAY', 'Congé'),
    ]
    
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE, 
        related_name='attendance_records',
        verbose_name="Employé"
    )
    date = models.DateField(verbose_name="Date", default=timezone.now)
    
    check_in = models.DateTimeField(null=True, blank=True, verbose_name="Heure d'arrivée")
    check_out = models.DateTimeField(null=True, blank=True, verbose_name="Heure de départ")
    
    check_in_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_in_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_out_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    check_out_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    check_in_photo = models.ImageField(upload_to='attendance/check_in/', null=True, blank=True)
    check_out_photo = models.ImageField(upload_to='attendance/check_out/', null=True, blank=True)
    
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Heures travaillées")
    overtime = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Heures supplémentaires")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PRESENT', verbose_name="Statut")
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    created_by = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='created_attendances'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Présence"
        verbose_name_plural = "Présences"
        unique_together = ['employee', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['employee', 'date']),
            models.Index(fields=['status']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.employee} - {self.date} - {self.get_status_display()}"
    
    def calculate_hours(self):
        if self.check_in and self.check_out:
            duration = self.check_out - self.check_in
            hours = duration.total_seconds() / 3600
            self.hours_worked = round(hours, 2)
            
            if hours > 8:
                self.overtime = round(hours - 8, 2)
            else:
                self.overtime = 0
            return self.hours_worked
        return 0
    
    def save(self, *args, **kwargs):
        self.calculate_hours()
        super().save(*args, **kwargs)

class AttendanceSettings(models.Model):
    """Paramètres de pointage"""
    company_name = models.CharField(max_length=200, default="Mon Entreprise")
    check_in_start = models.TimeField(default="08:00")
    check_in_end = models.TimeField(default="09:30")
    check_out_start = models.TimeField(default="16:30")
    check_out_end = models.TimeField(default="19:00")
    work_hours_per_day = models.DecimalField(max_digits=4, decimal_places=2, default=8)
    enable_geolocation = models.BooleanField(default=False)
    enable_photo = models.BooleanField(default=False)
    late_threshold_minutes = models.IntegerField(default=15, help_text="Minutes de tolérance pour les retards")
    auto_absent_after = models.TimeField(default="10:00", help_text="Heure à partir de laquelle l'absence est automatique")
    
    def __str__(self):
        return f"Paramètres de pointage - {self.company_name}"
    
    class Meta:
        verbose_name = "Paramètre de pointage"
        verbose_name_plural = "Paramètres de pointage"