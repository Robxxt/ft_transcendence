from django.db import models
from django.contrib.auth.models import AbstractBaseUser,  BaseUserManager
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
    won = models.IntegerField(default=0)
    lost = models.IntegerField(default=0)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    objects = UserManager()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['password']
    def __str__(self):
        return self.username
    
    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

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
