FROM nginx:latest

# Install OpenSSL for generating the self-signed certificate
RUN apt-get update && apt-get install -y openssl

# Create a directory for the SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Generate a self-signed SSL certificate
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/transcendence.com.key -out /etc/nginx/ssl/transcendence.com.crt -subj "/C=DE/ST=Heilbronn/L=Heilbronn/O=Organization/OU=Department/CN=transcendence.com"

# Copy the Nginx configuration file
COPY ./conf.d/django.conf /etc/nginx/conf.d/django.conf

# Expose ports for HTTP and HTTPS
EXPOSE 80 443

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
