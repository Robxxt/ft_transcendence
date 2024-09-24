from django.urls import path
from .views import index_view, login_view, registration_view, dashboard_view

urlpatterns = [
    path('', index_view, name='index'), # Main page route
    path('registration', registration_view, name='registration'),
    path('register', registration_view, name='register'),
]
