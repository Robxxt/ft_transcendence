from django.urls import path, include
from django.views.generic import TemplateView
from . import views
app_name = 'pong'
urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('home/', views.start_view, name='home'),
    path('join-game-room/', views.GameRoomView.as_view(), name='game_room'),
    path('game-room/<int:room_id>/', views.GameRoomView.as_view(), name='game_room'),
]