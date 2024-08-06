from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='login'),
    path('register/', views.register, name='register'),
    path('game/', views.game_view, name='game_view'),
]