# ---------------------------------------
# NeuroDyne Server — Production Dockerfile
# ---------------------------------------
# Runtime: Node 26 + tsx (no build step needed)
# Depends on: packages/shared (workspace)

FROM node:26-alpine AS base
# Corepack is no longer bundled with Node.js 25+, so install the workspace's
# pinned package-manager version explicitly.
RUN npm install --global pnpm@11.20.0
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile

# ---- Production ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEURODYNE_HOST=0.0.0.0
ENV NEURODYNE_PORT=4000

WORKDIR /app

# Copy workspace source
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
COPY package.json pnpm-workspace.yaml ./

EXPOSE 10000 9090

WORKDIR /app/apps/server
CMD ["pnpm", "exec", "tsx", "src/index.ts"]
