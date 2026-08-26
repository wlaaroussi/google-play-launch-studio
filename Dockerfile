# ==========================================================================
# Google Play Launch Studio - Dockerfile (Ultra-Lightweight & Fast Nginx Alpine)
# ==========================================================================

FROM nginx:alpine

# Default PORT environment variable for local & cloud platforms
ENV PORT=80

# Copy Nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy all static website files to Nginx web root
COPY . /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

# Substitute $PORT dynamically and start Nginx in foreground
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
