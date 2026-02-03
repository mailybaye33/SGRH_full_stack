from django import forms
from .models import Employee

class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = '__all__'
        exclude = ['user']
        widgets = {
            'date_naissance': forms.DateInput(attrs={'type': 'date'}),
            'date_embauche': forms.DateInput(attrs={'type': 'date'}),
            'email': forms.EmailInput(attrs={'placeholder': 'exemple@entreprise.com'}),
            'telephone': forms.TextInput(attrs={'placeholder': 'Numéro professionnel'}),
            'poste': forms.TextInput(attrs={'placeholder': 'Ex: Développeur'}),
        }
        labels = {
            'nom': 'Nom',
            'prenom': 'Prénom',
            'date_naissance': 'Date de naissance',
            'email': 'Email professionnel',
            'telephone': 'Téléphone professionnel',
            'date_embauche': 'Date d\'embauche',
            'poste': 'Poste occupé',
            'statut': 'Statut',
        }
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if Employee.objects.filter(email=email).exists():
            raise forms.ValidationError("Cet email est déjà utilisé par un autre employé.")
        return email