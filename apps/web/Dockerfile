FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN npm install --workspace=@nippia/shared --workspace=@nippia/web

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm run build --workspace=@nippia/shared
RUN npm run build --workspace=@nippia/web

FROM nginx:1.27-alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
