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

    def start_game(self):
        self.is_active = True
        self.game_state = 'playing'
        self.save()

    def update_game(self):
        if not self.is_active:
            return

        # Move ball
        self.ball_x += self.ball_speed_x
        self.ball_y += self.ball_speed_y

        # Ball collision with top and bottom walls
        if self.ball_y <= 0 or self.ball_y >= 1:
            self.ball_speed_y = -self.ball_speed_y

        # Ball collision with paddles
        paddle_width = 0.02
        paddle_height = 0.2
        if (self.ball_x <= paddle_width and self.paddle1_y <= self.ball_y <= self.paddle1_y + paddle_height) or \
           (self.ball_x >= 1 - paddle_width and self.paddle2_y <= self.ball_y <= self.paddle2_y + paddle_height):
            self.ball_speed_x = -self.ball_speed_x

        # Ball out of bounds
        if self.ball_x < 0:
            self.score2 += 1
            self.check_game_over()
            if not self.winner:
                self.game_state = 'scored'
                self.reset()
        elif self.ball_x > 1:
            self.score1 += 1
            self.check_game_over()
            if not self.winner:
                self.game_state = 'scored'
                self.reset()

        self.save()

    def check_game_over(self):
        if self.score1 >= 2:
            self.winner = 'Player 1'
            self.is_active = False
        elif self.score2 >= 2:
            self.winner = 'Player 2'
            self.is_active = False
        self.save()

    def move_paddle(self, player, position):
        if player == 1:
            self.paddle1_y = max(0, min(position, 0.8))
        else:
            self.paddle2_y = max(0, min(position, 0.8))
        self.save()