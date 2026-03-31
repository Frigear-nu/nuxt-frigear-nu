FROM guergeiro/pnpm:24-10 AS base

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install main app dependencies
RUN pnpm install --frozen-lockfile

COPY . .

FROM base AS build

# Build arguments for environment variables needed during build
ARG JWT_SECRET

# Set environment variables for build
ENV JWT_SECRET=$JWT_SECRET

RUN pnpm run build

FROM base AS dev

EXPOSE 3000

CMD ["pnpm", "run", "dev"]

FROM guergeiro/pnpm:24-10-alpine AS production

WORKDIR /app

COPY --from=build /app/.output /app

EXPOSE 3000

CMD ["pnpm", "run", "/app/server/index.mjs"]