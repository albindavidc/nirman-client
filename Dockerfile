# ================================
# Stage 1: Dependencies
# ================================
FROM node:20-alpine AS deps

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and pnpm config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Use hoisted node_modules layout for Angular CLI builder resolution
RUN echo "node-linker=hoisted" > .npmrc && pnpm install

# ================================
# Stage 2: Development
# ================================
FROM node:20-alpine AS development

RUN npm install -g pnpm

WORKDIR /app

# Copy package files and pnpm config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Use hoisted layout so Angular CLI can resolve @ngx-env/builder
RUN echo "node-linker=hoisted" > .npmrc && pnpm install

# Copy all source files
COPY . .

# Expose Angular dev server port
EXPOSE 4200

# Start Angular dev server with hot reload
# --host 0.0.0.0 allows access from outside container
# --poll ensures file changes are detected in Docker
CMD ["pnpm", "exec", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]

# ================================
# Stage 3: Builder
# ================================
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.npmrc ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy source code
COPY . .

# Build the application for production
RUN pnpm build --configuration=production

# ================================
# Stage 4: Production
# ================================
FROM nginx:alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist/nirman/browser /usr/share/nginx/html

# Create non-root user for security
RUN addgroup --system --gid 1001 nginx-app && \
    adduser --system --uid 1001 --ingroup nginx-app nginx-user && \
    chown -R nginx-user:nginx-app /usr/share/nginx/html && \
    chown -R nginx-user:nginx-app /var/cache/nginx && \
    chown -R nginx-user:nginx-app /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-app /var/run/nginx.pid

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]