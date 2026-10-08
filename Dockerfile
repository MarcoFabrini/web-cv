FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY tools ./tools
COPY public ./public
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache jq
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/40-web-cv-meta.sh /docker-entrypoint.d/
COPY --from=build /app/dist /usr/share/nginx/html
RUN mkdir -p /etc/web-cv && cp /usr/share/nginx/html/index.html /etc/web-cv/index.html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
