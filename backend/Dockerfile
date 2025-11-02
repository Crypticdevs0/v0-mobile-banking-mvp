# Backend Dockerfile for Express + Socket.io (PNPM)
FROM node:18-alpine AS deps
WORKDIR /usr/src/app
RUN apk add --no-cache libc6-compat git
RUN npm install -g pnpm
# Copy package manifests
COPY backend/package.json backend/pnpm-lock.yaml ./
# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY backend/ .

# Final image
FROM node:18-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Copy app from deps stage
COPY --from=deps /usr/src/app .
USER appuser
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --spider -q http://localhost:4000/ || exit 1
CMD ["node","server.js"]
