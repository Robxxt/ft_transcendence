from django import forms

class UserRegistrationForm(forms.Form):
    nickname = forms.CharField(max_length=50)
    password = forms.CharField(widget=forms.PasswordInput, max_length=50)
    email = forms.EmailField(max_length=50)
    won = forms.IntegerField(initial=0)
    lost = forms.IntegerField(initial=0)