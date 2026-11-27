FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_API_URL=/api/v1
ARG VITE_SOCKET_URL=
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_APP_URL=
ARG VITE_APP_ENV=production
ARG VITE_ENABLE_DEMO_LOGIN=false

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_ENABLE_DEMO_LOGIN=$VITE_ENABLE_DEMO_LOGIN

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN npm ci --no-audit --no-fund --fetch-retries=5 --maxsockets=4 --workspace=@nippia/shared --workspace=@nippia/web

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm run build --workspace=@nippia/shared
RUN npm run build --workspace=@nippia/web

FROM nginx:1.27-alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/api/health >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
