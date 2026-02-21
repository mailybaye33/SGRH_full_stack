# departments/models.py
from django.db import models

class Department(models.Model):
    """Modèle pour les départements"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    code = models.CharField(max_length=20, unique=True, blank=True, verbose_name="Code")
    
    # Chef du département (relation vers Employee dans l'app employees)
    head = models.ForeignKey(
        'employees.Employee',  # ← Important: guillemets et nom complet
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departments',
        verbose_name="Chef de département"
    )
    
    # Département parent (pour la hiérarchie)
    parent_department = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_departments',
        verbose_name="Département parent"
    )
    
    # Informations supplémentaires
    budget = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        verbose_name="Budget"
    )
    location = models.CharField(max_length=200, blank=True, verbose_name="Localisation")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Téléphone")
    email = models.EmailField(blank=True, verbose_name="Email")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Date de modification")
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Génère automatiquement un code si non fourni"""
        if not self.code:
            import re
            # Prend les 3 premières lettres du nom en majuscules
            base = re.sub(r'[^a-zA-Z]', '', self.name).upper()[:3]
            # Compte les départements avec le même préfixe
            count = Department.objects.filter(code__startswith=base).count()
            self.code = f"{base}{count + 1:03d}"
        super().save(*args, **kwargs)
    
    @property
    def employee_count(self):
        """Nombre d'employés dans ce département"""
        return self.employees.count()
    
    @property
    def sub_departments_count(self):
        """Nombre de sous-départements"""
        return self.sub_departments.count()
    
    @property
    def head_name(self):
        """Nom du chef de département"""
        return self.head.user.get_full_name() if self.head and self.head.user else "-"
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Département'
        verbose_name_plural = 'Départements'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['name']),
        ]