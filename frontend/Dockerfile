# Multi-stage Dockerfile for React SPA Frontend
# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx Alpine
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

