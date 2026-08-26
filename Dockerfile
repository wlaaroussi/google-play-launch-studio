# ==========================================================================
# Google Play Launch Studio - Dockerfile (Ultra-Lightweight & Fast Nginx Alpine)
# ==========================================================================

FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static website files to Nginx web root
COPY . /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
