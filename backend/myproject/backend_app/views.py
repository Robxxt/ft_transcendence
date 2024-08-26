from django.shortcuts import render
from .models import PongGame

def index_view(request):
    return render(request, 'index.html')  # Main page

def login_view(request):
    return render(request, 'login.html')  # Login page

def registration_view(request):
    return render(request, 'registration.html')  # Registration page

def dashboard_view(request):
    return render(request, 'dashboard.html')  # Dashboard page

def game_view(request):
    game, created = PongGame.objects.get_or_create(pk=1)
    
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'start':
            game.reset()
            game.start()
        elif action == 'reset':
            game.reset()
    
    context = {
        'game': game,
    }
    return render(request, 'game.html', context)