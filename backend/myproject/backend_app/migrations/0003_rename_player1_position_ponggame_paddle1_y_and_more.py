# Generated by Django 5.0.6 on 2024-08-26 14:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0002_ponggame'),
    ]

    operations = [
        migrations.RenameField(
            model_name='ponggame',
            old_name='player1_position',
            new_name='paddle1_y',
        ),
        migrations.RenameField(
            model_name='ponggame',
            old_name='player2_position',
            new_name='paddle2_y',
        ),
        migrations.RenameField(
            model_name='ponggame',
            old_name='player1_score',
            new_name='score1',
        ),
        migrations.RenameField(
            model_name='ponggame',
            old_name='player2_score',
            new_name='score2',
        ),
        migrations.RemoveField(
            model_name='ponggame',
            name='ball_dx',
        ),
        migrations.RemoveField(
            model_name='ponggame',
            name='ball_dy',
        ),
        migrations.AddField(
            model_name='ponggame',
            name='ball_speed_x',
            field=models.FloatField(default=0.005),
        ),
        migrations.AddField(
            model_name='ponggame',
            name='ball_speed_y',
            field=models.FloatField(default=0.005),
        ),
        migrations.AddField(
            model_name='ponggame',
            name='game_state',
            field=models.CharField(default='waiting', max_length=20),
        ),
        migrations.AddField(
            model_name='ponggame',
            name='winner',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]
