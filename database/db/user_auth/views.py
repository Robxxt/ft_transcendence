from django.shortcuts import render,redirect
from .models import User
from .form import UserRegistrationForm
# Create your views here.

def register(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            User.objects.create(
                nickname=form.cleaned_data['nickname'],
                password=form.cleaned_data['password'],
                email=form.cleaned_data['email'],
                won=form.cleaned_data['won'],
                lost=form.cleaned_data['lost']
            )
    else:
        form = UserRegistrationForm()
    return render(request, "register.html", {'form': form})

def home(request):
    return (render(request,'home.html'))

def game_view(request):
    return render(request, 'game.html') 