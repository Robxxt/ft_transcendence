from django.shortcuts import render
from backend_app.api import views

def index_view(request):
    return render(request, 'index.html') # Main page

def login_view(request):
    return render(request, 'login.html')  # Login page

def registration_view(request):
    return render(request, 'static/registration.html') # Registration page

def dashboard_view(request):
    return render(request, 'dashboard.html')  # Dashboard page
