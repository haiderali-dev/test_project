FROM node:24-bookworm-slim AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY backend/ ./

FROM node:24-bookworm-slim AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./

FROM frontend-deps AS frontend-build
RUN npm run build

FROM backend-deps AS backend-tests
ENV CI=true
RUN npm test -- --runInBand

FROM frontend-deps AS frontend-tests
ENV CI=true
RUN npm test -- --run --maxWorkers=2 --minWorkers=1

FROM backend-deps AS backend-production
RUN npm prune --omit=dev --no-audit --no-fund

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8080 DEPLOY_ENV=staging
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=${GIT_COMMIT}
LABEL org.opencontainers.image.revision=${GIT_COMMIT}
COPY --from=backend-production --chown=node:node /app/backend ./backend
COPY --from=frontend-build --chown=node:node /app/frontend/dist ./frontend/dist
COPY --chown=node:node scripts/smoke-test.js ./scripts/smoke-test.js
USER node
EXPOSE 8080
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=6 CMD node -e "fetch('http://127.0.0.1:8080/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "backend/server.js"]
