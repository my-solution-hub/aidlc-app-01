# syntax=docker/dockerfile:1
# Multi-stage build for awsome-shop-frontend (Vite + React 19 -> nginx)

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build with a relative API base URL so the bundled axios client issues
# same-origin requests (/auth, /product, /point, /order), which nginx then
# proxies to the gateway. Override with --build-arg VITE_API_BASE_URL=...
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
