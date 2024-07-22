FROM python:3.11

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

# RUN chmod a+x /app/wait_for_db.sh

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["python3". "manage.py", "runserver", "0.0.0.0:8000"]