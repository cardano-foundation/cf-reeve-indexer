#!/bin/bash
CSP_DOMAIN="*.$(echo "$VITE_API_URL" | cut -d'.' -f2-)"
sed -i "s|__CSP_DOMAIN__|${CSP_DOMAIN}|g" /etc/nginx/conf.d/default.conf
envsubst </app/env.global.tmp.js >/usr/share/nginx/html/env.global.js
nginx -g 'daemon off;'
