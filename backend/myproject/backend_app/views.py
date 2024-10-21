from django.shortcuts import render
from backend_app.api import views

def index_view(request, *args, **kwargs):
    return render(request, 'index.html')
