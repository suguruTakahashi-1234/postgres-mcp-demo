FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
FROM base AS dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Build the app
FROM dependencies AS build
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# Production image
FROM base AS production
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Run the app
CMD ["node", "dist/index.js"]
