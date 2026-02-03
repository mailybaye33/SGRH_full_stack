from django.db import models
from users.models import User

class Employee(models.Model):
    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee')
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    email = models.EmailField(max_length=150, unique=True)
    telephone = models.CharField(max_length=15)
    date_embauche = models.DateField()
    poste = models.CharField(max_length=100)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='ACTIF')
    
    def __str__(self):
        return f"{self.nom} {self.prenom} - {self.poste}"
    
    def get_full_name(self):
        return f"{self.nom} {self.prenom}"
    
    class Meta:
        verbose_name = "Employé"
        verbose_name_plural = "Employés"