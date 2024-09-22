#!/bin/sh

echo "Running migrations..."
python myproject/manage.py migrate --noinput
echo "Creating superuser..."
python myproject/manage.py createsuperuser --noinput
echo "Starting server..."
exec python myproject/manage.py runserver 0.0.0.0:8000