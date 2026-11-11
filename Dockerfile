FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css main.js copy.js /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY taag-virtual /usr/share/nginx/html/taag-virtual
COPY world-virtual /usr/share/nginx/html/world-virtual
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
