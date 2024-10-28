from django.contrib import admin
from .models import Room, UserProfile

# Register your models here.

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'games_played', 'wins', 'draws')
	show_facets = admin.ShowFacets.ALWAYS

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
	list_display = ('name', 'player1', 'player2', 'winner', 'is_draw', 'created_at')
	show_facets = admin.ShowFacets.ALWAYS
