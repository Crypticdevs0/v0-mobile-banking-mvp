# Frontend multi-stage Dockerfile for Next.js (PNPM)
# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat git
# Install pnpm
RUN npm install -g pnpm
# Copy manifests and install deps with cache
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
# Copy source and build
COPY . .
RUN pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Copy Next.js standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --spider -q http://localhost:3000/ || exit 1
CMD ["node","server.js"]
