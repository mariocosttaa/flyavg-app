# syntax=docker/dockerfile:1

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# --include=dev: Coolify passes NODE_ENV=production at build time, which would skip Vite and
# the other build tools. The runtime image is nginx, so nothing needs pruning.
RUN npm ci --include=dev --no-audit --no-fund

COPY . .

# VITE_* values are inlined at build time and public: one image per environment.
# Decision pending (AVG-7): per-environment builds vs a runtime /config.json.
ARG VITE_API_URL=http://localhost:3000
ARG VITE_APP_ENV=production
ARG VITE_SITE_URL=http://localhost:8080
ARG VITE_SENTRY_DSN=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN

# The build also runs the portal/admin bundle boundary check; the manifest is not served.
RUN npm run build && rm -rf dist/.vite

# ---- runtime ----
FROM nginx:1.29-alpine

ARG VITE_API_URL=http://localhost:3000
# The app calls the API from the browser, so CSP connect-src must allow its origin.
ENV CSP_CONNECT_SRC="'self' ${VITE_API_URL}"

COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template
COPY deploy/security-headers.conf /etc/nginx/templates/snippets/security-headers.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Checks that the portal HTML is actually served, not just that nginx answers.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/index.html || exit 1
