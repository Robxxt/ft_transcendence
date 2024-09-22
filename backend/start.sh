#!/bin/sh

echo "Running migrations..."
python myproject/manage.py migrate --noinput
echo "Creating superuser..."
python myproject/manage.py createsuperuser --noinput
echo "Starting server..."
python myproject/manage.py runserver 0.0.0.0:8000

# sleep 5
# pytest
# if [ $? -ne 0 ]; then
#   echo "Tests failed. Stopping server..."
#   kill $!
#   exit 1
# fi