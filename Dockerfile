# Frontend multi-stage Dockerfile for Next.js (PNPM)
# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat git
# Install pnpm
RUN npm install -g pnpm
# Copy package manifests first for caching
COPY package.json pnpm-lock.yaml ./
COPY app/package.json ./app/package.json
# Install deps (root workspace and app deps)
RUN pnpm install --frozen-lockfile

# Copy everything and build
COPY . .
RUN pnpm build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Install a small runtime (pnpm) to run start script
RUN npm install -g pnpm
# Copy built files and necessary assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --spider -q http://localhost:3000/ || exit 1
CMD ["pnpm","start","-p","3000"]
