# Generated by Django 5.0.6 on 2024-10-05 10:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend_app', '0009_alter_user_username'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last login'),
        ),
    ]
