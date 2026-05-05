FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile 2>/dev/null || npm install

COPY . .
RUN npm run build

FROM node:20-alpine

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

ENV NODE_ENV=production

EXPOSE 8080 9090

CMD ["node", "dist/index.js"]
