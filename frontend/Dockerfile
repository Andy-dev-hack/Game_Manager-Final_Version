# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (use npm ci for deterministic installs)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build args
ARG VITE_API_URL=http://localhost:3500
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
