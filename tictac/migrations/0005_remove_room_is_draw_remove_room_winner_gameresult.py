# Generated by Django 5.1.1 on 2024-10-16 21:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tictac', '0004_room_is_draw_room_winner'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='room',
            name='is_draw',
        ),
        migrations.RemoveField(
            model_name='room',
            name='winner',
        ),
        migrations.CreateModel(
            name='GameResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('state', models.CharField(choices=[('FN', 'Finished'), ('UFN', 'Unfinished')], default='UFN', max_length=3)),
                ('winner', models.CharField(blank=True, max_length=50, null=True)),
                ('is_draw', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_results', to='tictac.room')),
            ],
        ),
    ]
