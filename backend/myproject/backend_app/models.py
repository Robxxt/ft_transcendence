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

class UserMetric(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avarage = models.IntegerField(default=0)
    allPoints = models.IntegerField(default=0)
    longestStreak = models.IntegerField(default=0)
    allPoints = models.IntegerField(default=0)
    
    def __str__(self) -> str:
        return f'this is {self.user.nickname} Profile'
