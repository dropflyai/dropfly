# DropFly Channels Bridge — Dockerfile
# Lightweight Node.js service

FROM node:22-alpine AS builder

WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine

RUN adduser -D -h /app dropfly
WORKDIR /app

COPY --from=builder /build/package.json /build/package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /build/dist/ ./dist/

USER dropfly

EXPOSE 3420

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3420/health || exit 1

CMD ["node", "dist/index.js"]
