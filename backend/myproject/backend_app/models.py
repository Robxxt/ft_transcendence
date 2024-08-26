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
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    player1_position = models.FloatField(default=0.5)  # Paddle position (0 to 1)
    player2_position = models.FloatField(default=0.5)
    ball_x = models.FloatField(default=0.5)  # Ball position (0 to 1)
    ball_y = models.FloatField(default=0.5)
    ball_dx = models.FloatField(default=0.01)  # Ball direction and speed
    ball_dy = models.FloatField(default=0.01)
    is_active = models.BooleanField(default=False)

    def reset(self):
        self.player1_score = 0
        self.player2_score = 0
        self.player1_position = 0.5
        self.player2_position = 0.5
        self.ball_x = 0.5
        self.ball_y = 0.5
        self.ball_dx = 0.01
        self.ball_dy = 0.01
        self.is_active = False
        self.save()
    
    def start(self):
        self.is_active = True
        self.save()
    
    def end(self):
        self.is_active = False
        self.save()