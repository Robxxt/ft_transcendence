from django.db import models

# Create your models here.
class User(models.Model):
    nickname = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    won = models.IntegerField()
    lost = models.IntegerField()

class TableMatch(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1_matches')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2_matches')
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    position_player1 = models.IntegerField(default=0)
    position_player2 = models.IntegerField(default=0)


class PongGame(models.Model):
    ball_x = models.FloatField(default=0.5)
    ball_y = models.FloatField(default=0.5)
    ball_speed_x = models.FloatField(default=0.005)
    ball_speed_y = models.FloatField(default=0.005)
    paddle1_y = models.FloatField(default=0.5)
    paddle2_y = models.FloatField(default=0.5)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    is_active = models.BooleanField(default=False)
    game_state = models.CharField(max_length=20, default='waiting')
    winner = models.CharField(max_length=20, null=True, blank=True)

    def reset(self):
        self.ball_x = 0.5
        self.ball_y = 0.5
        self.ball_speed_x = 0.005 if self.ball_speed_x > 0 else -0.005
        self.ball_speed_y = 0.005 if self.ball_speed_y > 0 else -0.005
        self.paddle1_y = 0.5
        self.paddle2_y = 0.5
        self.is_active = False
        self.game_state = 'waiting'
        self.save()