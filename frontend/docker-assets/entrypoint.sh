#!/bin/sh
set -eu

: "${VITE_API_URL:?VITE_API_URL must be set}"

CSP_DOMAIN="$(printf '%s\n' "$VITE_API_URL" | cut -d'.' -f2- -s)"
if [ -n "$CSP_DOMAIN" ]
then
    CSP_DOMAIN="*.$CSP_DOMAIN"
else
    # If there is no "." in the URL, use its authority as the CSP source.
    CSP_DOMAIN="$(printf '%s\n' "$VITE_API_URL" | cut -d'/' -f3-)"
fi

RUNTIME_DIR=/tmp/frontend-runtime
NGINX_TEMP_DIR="$RUNTIME_DIR/nginx"
mkdir -p \
    "$NGINX_TEMP_DIR/client_body" \
    "$NGINX_TEMP_DIR/proxy" \
    "$NGINX_TEMP_DIR/fastcgi" \
    "$NGINX_TEMP_DIR/uwsgi" \
    "$NGINX_TEMP_DIR/scgi"
sed "s|__CSP_DOMAIN__|${CSP_DOMAIN}|g" \
    /app/runtime-csp.conf.template >"$RUNTIME_DIR/csp.conf"
envsubst '${VITE_API_URL} ${VITE_VERSION}' \
    </app/env.global.tmp.js >"$RUNTIME_DIR/env.global.js"

exec nginx -g "pid $NGINX_TEMP_DIR/nginx.pid; daemon off;"
