# Generated by Django 4.2.16 on 2024-11-03 15:05

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0015_merge_0013_tictacroom_0014_alter_user_avatar'),
    ]

    operations = [
        migrations.CreateModel(
            name='TictacGame',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player2', models.CharField(blank=True, max_length=50, null=True)),
                ('winner', models.CharField(blank=True, max_length=50, null=True)),
                ('is_draw', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('player1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player1_tictac', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.DeleteModel(
            name='TicTacRoom',
        ),
    ]
