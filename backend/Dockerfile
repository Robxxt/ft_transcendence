FROM python:3.11.2

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app/
COPY start.sh /app/

RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 8000

# CMD ["python", "myproject/manage.py", "runserver", "0.0.0.0:8000"]
CMD ["./start.sh"]