from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

class UserForm(UserCreationForm):
    num_phone = forms.CharField(max_length=15, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'num_phone', 'role', 'password1', 'password2']
        widgets = {
            'role': forms.Select(choices=User.ROLE_CHOICES),
        }

class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'num_phone', 'role', 'is_active']