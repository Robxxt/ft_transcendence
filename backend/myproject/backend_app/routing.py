from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/game/', consumers.PongGameConsumer.as_asgi()),
]