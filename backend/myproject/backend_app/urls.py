from django.urls import path, re_path
from .views import index_view, login_view, registration_view, dashboard_view, game_view

urlpatterns = [
    path('', index_view, name='index'),            # Main page route
    path('game/', game_view, name='game'),          # Game page route
    re_path(r'^.*$', index_view, name='index'),                   # Catch all route
]
