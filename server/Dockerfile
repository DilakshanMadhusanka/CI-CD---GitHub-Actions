# Server Dockerfile
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose server port
EXPOSE 5000

ENV NODE_ENV=production

# Start the application
CMD ["node", "src/index.js"]
