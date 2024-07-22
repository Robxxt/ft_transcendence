FROM debian:12

WORKDIR /app

COPY requirements.txt /app

# RUN pip install --no-cache-dir -r requirements.txt

# COPY . /app

COPY wait_for_db.sh /app

RUN chmod +x /app/wait_for_db.sh

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

#CMD ["python3". "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["ls", "-la", "./wait_for_db.sh"]