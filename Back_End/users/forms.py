from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

class UserForm(UserCreationForm):
    num_phone = forms.CharField(
        max_length=15,
        required=True,
        widget=forms.TextInput(attrs={'placeholder': 'Ex: +225 01 23 45 67 89'})
    )
    
    class Meta:
        model = User
        fields = ['username', 'num_phone', 'role', 'password1', 'password2']
        widgets = {
            'role': forms.Select(choices=User.ROLE_CHOICES),
        }
        labels = {
            'num_phone': 'Numéro de téléphone',
            'role': 'Rôle',
        }
    
    def clean_num_phone(self):
        num_phone = self.cleaned_data.get('num_phone')
        if User.objects.filter(num_phone=num_phone).exists():
            raise forms.ValidationError("Ce numéro de téléphone est déjà utilisé.")
        return num_phone

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'num_phone', 'role', 'is_active']
        widgets = {
            'role': forms.Select(choices=User.ROLE_CHOICES),
        }
        labels = {
            'num_phone': 'Numéro de téléphone',
        }