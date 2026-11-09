# ~12 MB image: static files on nginx's slim Alpine build, no modules or shell tooling beyond busybox.
FROM nginx:1.29-alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/
EXPOSE 80
