from django.urls import path
from . import views

# URL configuration
urlpatterns = [
	path('', views.welcome),
	path('create-room/', views.create_room, name='create_room'),
	path('<str:room_name>/', views.run_game, name='run_game'),
	path('<str:room_name>/save-result/', views.save_game_result, name='save_game_result')
]
