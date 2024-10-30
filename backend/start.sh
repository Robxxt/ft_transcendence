#!/bin/sh

sleep 3
echo "Running migrations..."
python myproject/manage.py migrate
echo "Creating superuser..."
python myproject/manage.py createsuperuser --noinput
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