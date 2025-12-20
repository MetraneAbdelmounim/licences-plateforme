FROM nginx:latest

# Create SSL directories
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Copy signed certs
COPY server.crt /etc/ssl/certs/
COPY server.key /etc/ssl/private/
COPY ca.crt /etc/ssl/certs/

# Nginx config
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
