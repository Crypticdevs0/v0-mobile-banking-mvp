# Multi-stage production build for Premier America Credit Union Banking App

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install --production=false --legacy-peer-deps && npm cache clean --force

# Copy source
COPY . .

# Build Next.js app
RUN npm run build

# Stage 2: Runtime - includes both frontend and backend
FROM node:20-alpine
WORKDIR /app

# Install dumb-init for proper signal handling and curl for healthchecks
# IMPORTANT: Do NOT pass secrets as build args or copy .env files into the image. Use platform secrets at runtime.
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./

RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# Copy built frontend from builder. If Next.js standalone output exists, use it.
# Standalone output lives in .next/standalone with a server.js entrypoint and .next/static
COPY --from=frontend-builder /app/.next/standalone ./
COPY --from=frontend-builder /app/.next/static ./.next/static
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/next.config.mjs ./

# Copy backend code
COPY backend ./backend

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

# Expose ports
EXPOSE 3000 3001

# Start with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# If Next standalone server exists, run it; otherwise fall back to backend/server.js
CMD ["sh", "-c", "if [ -f ./server.js ]; then node server.js; else node backend/server.js; fi"]
