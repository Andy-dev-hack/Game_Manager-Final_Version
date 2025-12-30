# Use official Node.js Alpine image (Lightweight)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript (dist folder)
RUN npm run build

# Prune dev dependencies to keep image small (Optional, but recommended for prod)
# Note: We keep 'dependencies' needed for runtime
RUN npm prune --production

# Expose the API port
EXPOSE 3500

# Start the application
CMD ["npm", "start"]
