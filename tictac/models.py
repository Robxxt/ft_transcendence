from django.db import models

# Create your models here.

class UserProfile(models.Model):
	user = models.CharField(max_length=50, blank=True, null=True)
	games_played = models.IntegerField(default=0)
	wins = models.IntegerField(default=0)
	draws = models.IntegerField(default=0)

	def __str__(self):
		return self.user

class Room(models.Model):
	name = models.CharField(max_length=50, unique=True)
	player1 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='player1')
	player2 = models.CharField(max_length=50, blank=True, null=True)
	winner = models.CharField(max_length=50, blank=True, null=True)
	is_draw = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.name
