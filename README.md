# ft_transcendence

You must have a .env file in the root of the directory with the next variables.

SMTP_SMARTHOST=smtp.gmail.com:587
SMTP_FROM=testingmaill@example.com
SMTP_AUTH_USERNAME=testingmaill@example.com
SMTP_AUTH_PASSWORD=testing
GF_SECURITY_ADMIN_USER=testing_user
GF_SECURITY_ADMIN_PASSWORD=test123
DATABASE_NAME=ping_pong_user
DATABASE_USER=test_user
DATABASE_PASSWORD=test123
DATABASE_HOST=postgres
DATABASE_PORT=5432
POSTGRES_DB=ping_pong_user
POSTGRES_USER=thesheriff
POSTGRES_PASSWORD=test123
DATA_SOURCE_NAME=postgresql://postgres_exporter:$POSTGRES_PASSWORD@localhost:5432/postgres?sslmode=disable
DJANGO_SUPERUSER_USERNAME=admin123
DJANGO_SUPERUSER_EMAIL=admin@trancendence.42
DJANGO_SUPERUSER_PASSWORD=Ch@ngeMe
DJANGO_SECRET_KEY="your secret"
