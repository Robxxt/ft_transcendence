#!/bin/sh

sleep 2
echo "Running migrations..."
python myproject/manage.py migrate --noinput
echo "Creating superuser..."
python myproject/manage.py createsuperuser --noinput
echo "Creating game_ai user..."
python myproject/manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_user(username='game_ai', email='game_ai@game_ai.game_ai', password='game_ai') if not User.objects.filter(username='game_ai').exists() else None"
echo "Starting server..."
python myproject/manage.py runserver 0.0.0.0:8000
#daphne -b 0.0.0.0 -p 8000 backend_setting.asgi:application

# sleep 5
# pytest
# if [ $? -ne 0 ]; then
#   echo "Tests failed. Stopping server..."
#   kill $!
#   exit 1
# fi