from django.db import models
from django.contrib.auth.models import AbstractBaseUser,  BaseUserManager
from django.core.exceptions import ValidationError
# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_field):
        if not username:
            raise ValueError("Please fill the username")
        user = self.model(username=username, **extra_field)
        user.set_password(password)
        user.save(using=self.db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(username, password, **extra_fields)

class User(AbstractBaseUser):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=150)
    email = models.CharField(max_length=50)
    avatar = models.ImageField(upload_to='avatar/', default='/avatar/default.png', null=True, blank=True)
    display_name = models.CharField(max_length=50, unique=True, null=True, blank=True)
    won = models.IntegerField(default=0)
    lost = models.IntegerField(default=0)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    friends = models.ManyToManyField("self", blank=True, symmetrical=True)
    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['password']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def save(self, *args, **kwargs):
        if not self.display_name:
            self.display_name = self.username
        super().save(*args, **kwargs)

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

def validate_players_different(instance, value):
    if instance.player1 == value:
        raise ValidationError("Player 2 cannot be the same as Player 1.")

class GameRoom(models.Model):
    class State(models.TextChoices):
        WAITING = 'WA', 'Waiting'
        FULL = 'FL', 'Full'

    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2', null=True, blank=True, validators=[validate_players_different])
    state = models.CharField(max_length=2, choices=State.choices, default=State.WAITING)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    tournament = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='game_rooms', null=True, blank=True)

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

class Tournament(models.Model):
    class State(models.TextChoices):
        WAITING = 'WA', 'Waiting'
        FULL = 'FL', 'Full'
        FINISHED = 'FI', 'Finished'
    tournament_name = models.CharField(max_length=50)
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1_tournament')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2_tournament', null=True, blank=True)
    player3 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player3_tournament', null=True, blank=True)
    player4 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player4_tournament', null=True, blank=True)
    game1 = models.ForeignKey(GameRoom, on_delete=models.SET_NULL, related_name='game1_tournament', null=True, blank=True)
    game2 = models.ForeignKey(GameRoom, on_delete=models.SET_NULL, related_name='game2_tournament', null=True, blank=True)
    game3 = models.ForeignKey(GameRoom, on_delete=models.SET_NULL, related_name='game3_tournament', null=True, blank=True)
    tournament_winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tournament_winner', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    state = models.CharField(max_length=2, choices=State.choices, default=State.WAITING)

    _created_games = False

    def save(self, *args, **kwargs):
        # If all players are set, set the state to FULL
        if self.player1 and self.player2 and self.player3 and self.player4:
            self.state = Tournament.State.FULL
        else:
            self.state = Tournament.State.WAITING

        # Save the tournament instance
        super().save(*args, **kwargs)

        # Create game1 and game2 if the tournament is full and games have not yet been created
        if self.state == Tournament.State.FULL and not self._created_games:
            self.create_initial_games()

    def create_initial_games(self):
        """Create game1 and game2 if players are set and the games are not yet created."""
        # Ensure that game1 and game2 are created only once
        if not self.game1:
            self.game1 = GameRoom.objects.create(
                player1=self.player1,
                player2=self.player2,
                tournament=self,
                state=GameRoom.State.FULL
            )
        if not self.game2:
            self.game2 = GameRoom.objects.create(
                player1=self.player3,
                player2=self.player4,
                tournament=self,
                state=GameRoom.State.FULL
            )
        # Prevent recursion during save
        self._created_games = True
        # Save again to associate the game1 and game2 to the tournament
        self.save()

    def __str__(self):
        return self.tournament_name

class TictacGame(models.Model):
	player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1_tictac')
	player2 = models.CharField(max_length=50, blank=True, null=True)
	winner = models.CharField(max_length=50, blank=True, null=True)
	is_draw = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return str(self.id)
