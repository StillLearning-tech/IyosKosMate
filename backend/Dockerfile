# Multi-stage Dockerfile for Node.js Backend Microservice
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Security: run as non-root user
USER node

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

EXPOSE 5000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]

