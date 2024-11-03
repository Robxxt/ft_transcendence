from django.urls import path
from .views import index_view
urlpatterns = [
    path('', index_view, name='index'), # main page
    path('<path:resource>', index_view),  # Catchall for all other unmatched routes
]
