# Generated by Django 5.1.1 on 2024-10-09 12:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0008_ponggame_created_at_ponggame_finished_at_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ponggame',
            name='ball_speed_x',
        ),
        migrations.RemoveField(
            model_name='ponggame',
            name='ball_speed_y',
        ),
        migrations.RemoveField(
            model_name='ponggame',
            name='ball_x',
        ),
        migrations.RemoveField(
            model_name='ponggame',
            name='ball_y',
        ),
        migrations.RemoveField(
            model_name='ponggame',
            name='paddle1_y',
        ),
        migrations.RemoveField(
            model_name='ponggame',
            name='paddle2_y',
        ),
    ]
