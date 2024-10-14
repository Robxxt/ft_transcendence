from django.urls import re_path
from .consumers import ChatRoomConsumer, PongConsumer

websocket_urlpatterns = [
    re_path(r'ws/game-room/(?P<room_name>\w+)/$', ChatRoomConsumer.as_asgi()),
    re_path(r'ws/game/(?P<room_name>\w+)/$', PongConsumer.as_asgi()),
]
