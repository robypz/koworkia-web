# Build stage
FROM node:26-alpine AS builder

WORKDIR /app

# Install bun
RUN npm install -g bun@1.3.14

# Copy manifests first (leverage layer caching)
COPY package.json bun.lock* ./

# Install dependencies with bun
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the Angular app
RUN bun run build

# Serve stage - use Nginx for optimal static file serving
FROM nginx:alpine

# Copy built application from builder
COPY --from=builder /app/dist/koworkia-spa/browser /usr/share/nginx/html

# Copy Nginx config for SPA routing (essential for Angular)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
