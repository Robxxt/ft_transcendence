from django.urls import path
from .views import index_view,login_view,register_view

urlpatterns = [
    path('', index_view, name='index'), # main page
	path('login/', login_view, name='login'), # login
	path('registration/', register_view, name='register'), # registration
]
