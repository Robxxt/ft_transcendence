from django.contrib import admin
from .models import PongGame, GameRoom, UserProfile

# Register your models here.
@admin.register(PongGame)
class PongGameAdmin(admin.ModelAdmin):
    list_display = ('id', 'score1', 'score2', 'is_active', 'game_state', 'winner', 'created_at', 'started_at', 'finished_at')
    list_filter = ('is_active', 'game_state')
    show_facets = admin.ShowFacets.ALWAYS

@admin.register(GameRoom)
class GameRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'player1', 'player2', 'state', 'created_at', 'started_at', 'finished_at')
    list_filter = ('state',)
    show_facets = admin.ShowFacets.ALWAYS

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'games_played', 'games_won')
    show_facets = admin.ShowFacets.ALWAYS