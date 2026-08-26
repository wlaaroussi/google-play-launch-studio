# ==========================================================================
# Google Play Launch Studio - Dockerfile (Node.js + SQLite Backend)
# ==========================================================================

FROM node:20-slim

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Ensure data directory exists for SQLite database persistence
RUN mkdir -p data

# Default environment port
ENV PORT=3000
EXPOSE 3000

# Start Node.js server
CMD ["node", "server.js"]
