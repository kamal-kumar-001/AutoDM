# Stage 1: Build
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copy package configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui

# Generate Prisma Client & Build
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN pnpm --filter @autodm/api build

# Stage 2: Runtime
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

RUN pnpm install --prod --frozen-lockfile

EXPOSE 4000
CMD ["node", "dist/apps/api/src/main.js"]
