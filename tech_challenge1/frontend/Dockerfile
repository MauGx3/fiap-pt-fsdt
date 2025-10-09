# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html
RUN rm -f /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist ./
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/cache/nginx /var/run \
    && chown -R nginx:nginx /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/run
EXPOSE 8080
USER nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
