FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm install --no-audit --no-fund --fetch-retries=5 --maxsockets=4 --workspace=@nippia/shared --workspace=@nippia/api

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm run build --workspace=@nippia/shared
RUN npm run db:generate --workspace=@nippia/api
RUN npm run build --workspace=@nippia/api

EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --schema=apps/api/prisma/schema.prisma && npm run start --workspace=@nippia/api"]
