FROM dhi.io/node:26-alpine3.23-dev AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM dhi.io/nginx:1.30-alpine-dev AS frontend
WORKDIR /app
ARG VITE_VERSION="0.0.0"
ENV VITE_VERSION $VITE_VERSION
# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY docker-assets/nginx-conf.d /etc/nginx/conf.d
COPY --from=build /app/dist /usr/share/nginx/html
COPY env.global.tmp.js /app/env.global.tmp.js
COPY docker-assets/runtime-csp.conf.template /app/runtime-csp.conf.template
COPY package.json /app/
COPY docker-assets/entrypoint.sh /app/entrypoint.sh

# Match the unprivileged account used by the non-dev DHI Nginx image.
USER 65532:65532

EXPOSE 8080

CMD ["sh", "/app/entrypoint.sh"]
