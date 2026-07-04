# Multi-stage Dockerfile for BookBuddy AI Enterprise Backend
# Stage 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy source code and Prisma schema
COPY prisma ./prisma
COPY server ./server
COPY src ./src
COPY index.html ./
COPY tailwind.config.js ./

# Generate Prisma Client and run production build
RUN npx prisma generate
RUN npm run build

# Stage 2: Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled backend bundle, Prisma schema, and generated client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/server/uploads ./server/uploads

# Expose required container ingress port
EXPOSE 3000

# Healthcheck to verify container readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Start enterprise production server
CMD ["node", "dist/server.cjs"]
