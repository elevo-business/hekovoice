FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json tsconfig.json ./
COPY server ./server
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini && addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
# Non-TypeScript assets needed at runtime (loaded via fs.readFileSync at module init)
COPY server/db/migrations          ./dist/server/db/migrations
COPY server/render/templates       ./dist/server/render/templates
COPY server/admin-ui               ./dist/server/admin-ui
# Original HTML files (used by content-seed script)
COPY index.html termin.html        ./
RUN mkdir -p /data && chown -R app:app /data /app
USER app
ENV DATABASE_PATH=/data/cms.db
EXPOSE 3000
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server/index.js"]
