from django.urls import path
from .views import index_view
urlpatterns = [
    path('', index_view, name='index'), # main page
	# path('login/', login_view, name='login'), # login
	# path('registration/', register_view, name='register'), # registration
	# path('start/', start_view, name='start'),
	# path('profile/', profile_view, name='profile'), #profile
]
