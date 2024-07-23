from django.db import models

# Create your models here.
class User(models.Model):
    nickname = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    won = models.IntegerField()
    lost = models.IntegerField()