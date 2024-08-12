# db/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from backend_app.channels.routing import websocket_urlpatterns  # Import your WebSocket URL patterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'db.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handles HTTP requests
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns  # This should contain your WebSocket URLs
        )
    ),
})
