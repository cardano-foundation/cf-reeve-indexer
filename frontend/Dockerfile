FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM nginx:1.25-alpine AS frontend
WORKDIR /app
ARG VITE_VERSION="0.0.0"
ENV VITE_VERSION $VITE_VERSION
# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY docker-assets/nginx-conf.d /etc/nginx/conf.d
COPY --from=build /app/dist /usr/share/nginx/html
COPY env.global.tmp.js /app/env.global.tmp.js
COPY package.json /app/
COPY docker-assets/entrypoint.sh /app/entrypoint.sh

EXPOSE 80

CMD ["sh", "/app/entrypoint.sh"]
