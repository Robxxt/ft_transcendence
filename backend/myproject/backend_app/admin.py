from django.contrib import admin
from .models import User, UserMetric, GameRoom, PongGame, TictacGame
# Register your models here.

admin.site.register(User)
admin.site.register(UserMetric)
admin.site.register(GameRoom)
admin.site.register(PongGame)
admin.site.register(TictacGame)
