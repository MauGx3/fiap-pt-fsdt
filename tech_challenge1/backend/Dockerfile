## Multi-stage Dockerfile for backend (Node.js)
# - Stage 1: install dependencies (including dev) and run tests optionally
# - Stage 2: production image with only runtime deps and app code

FROM node:22-alpine AS deps
WORKDIR /usr/src/app

# Copy package manifests first for better caching
COPY package*.json ./

# Install production dependencies only (we will copy dev deps in build stage if needed)
RUN npm ci --omit=dev

FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Copy manifest and install all dependencies for build (including dev)
COPY package*.json ./
RUN npm ci

# Copy source and run build/test if you have build steps
COPY . .
# If your project has tests or a build step you can run them here (optional)
# RUN npm test -- --coverage
# RUN npm run build

FROM node:22-alpine AS production
WORKDIR /usr/src/app

# Create a non-root user early to avoid expensive chown later
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the production node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application source
COPY --from=builder /usr/src/app .

# Ensure ownership is correct
RUN chown -R appuser:appgroup /usr/src/app

# Use non-root user
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

# Minimal start command
CMD ["node", "index.js"]
FROM node:lts-alpine
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm pkg delete scripts.prepare
RUN if [ "$NODE_ENV" = "production" ]; then \
    npm install --production || npm install --legacy-peer-deps --production; \
    else \
    npm install --include=dev || npm install --legacy-peer-deps --include=dev; \
    fi
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
