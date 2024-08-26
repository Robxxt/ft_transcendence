# db/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from backend_app.channels.routing import websocket_urlpatterns  # Import your WebSocket URL patterns
import backend_app.routing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handles HTTP requests
    "websocket" : AllowedHostsOriginValidator(
        AuthMiddlewareStack(URLRouter(backend_app.routing.websocket_urlpatterns))
    ),
    # "websocket": AuthMiddlewareStack(
    #     URLRouter(
    #         websocket_urlpatterns  # This should contain your WebSocket URLs
    #     )
    # ),
})
