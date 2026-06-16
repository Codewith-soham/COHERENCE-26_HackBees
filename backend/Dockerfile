FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Production install only
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (will be overridden by env if passed, but good for doc)
EXPOSE 5000

# Start server
CMD ["npm", "start"]
