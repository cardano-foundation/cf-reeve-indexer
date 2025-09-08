#!/bin/bash
CSP_DOMAIN="$(echo "$VITE_API_URL" | cut -d'.' -f2- -s)"
if [ -n "$CSP_DOMAIN" ] 
then
    CSP_DOMAIN="*.$CSP_DOMAIN"
else
    # if no "." in URL simply cut scheme from URL
    CSP_DOMAIN=$(echo "$VITE_API_URL" | cut -d'/' -f3-)
fi
sed -i "s|__CSP_DOMAIN__|${CSP_DOMAIN}|g" /etc/nginx/conf.d/default.conf
envsubst </app/env.global.tmp.js >/usr/share/nginx/html/env.global.js
nginx -g 'daemon off;'
