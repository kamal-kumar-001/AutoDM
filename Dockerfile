# Stage 1: Build
FROM node:20-alpine AS builder
# Install OpenSSL and compat libraries required by Prisma Query Engine on Alpine
RUN apk add --no-cache openssl libc6-compat
RUN npm install -g pnpm
WORKDIR /app

# Copy package configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/

# Install dependencies
RUN pnpm install

# Copy source code
COPY apps/api ./apps/api
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
COPY packages/config ./packages/config

# Build workspace dependency packages first
RUN pnpm --filter @autodm/types build

# Generate Prisma Client using pnpm workspace context & Build NestJS app
RUN pnpm --filter @autodm/api prisma:generate
RUN pnpm --filter @autodm/api build

# Stage 2: Runtime
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
