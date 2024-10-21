from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.

class UserProfile(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='user_profile')
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    class State(models.TextChoices):
        ONLINE = 'ON', 'Online'
        OFFLINE = 'OF', 'Offline'
        READY = 'RE', 'Ready'
        PLAYING = 'PL', 'Playing'
    state = models.CharField(max_length=2, choices=State, default=State.OFFLINE)
    def __str__(self):
        return self.user.username

def validate_players_different(value, instance):
    if instance.player1 == value:
        raise ValidationError("Player 2 cannot be the same as Player 1.")
class GameRoom(models.Model):
    class State(models.TextChoices):
        WAITING = 'WA', 'Waiting'
        FULL = 'FL', 'Full'
    
    player1 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='player2', null=True, blank=True, validators=[validate_players_different])
    state = models.CharField(max_length=2, choices=State.choices, default=State.WAITING)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    # debug
    isAiPlay = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player1} vs {self.player2}"

    def clean(self):
        if self.player1 == self.player2:
            raise ValidationError("Player 2 cannot be the same as Player 1.")


class PongGame(models.Model):
    class State(models.TextChoices):
        WAITING = 'WA', 'Waiting'
        PLAYING = 'PL', 'Playing'
        FINISHED = 'FI', 'Finished'

    room = models.OneToOneField(GameRoom, on_delete=models.CASCADE, related_name='pong_game', null=True)

    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)

    is_active = models.BooleanField(default=False)
    game_state = models.CharField(max_length=2, choices=State.choices, default=State.WAITING)
    winner = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def reset(self):
        self.is_active = False
        self.game_state = PongGame.State.WAITING
        self.score1 = 0
        self.score2 = 0
        self.winner = None
        self.save()