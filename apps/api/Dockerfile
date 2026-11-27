FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm ci --no-audit --no-fund --fetch-retries=5 --maxsockets=4 --workspace=@nippia/shared --workspace=@nippia/api

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm run build --workspace=@nippia/shared
RUN npm run db:generate --workspace=@nippia/api
RUN npm run build --workspace=@nippia/api

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm ci --omit=dev --no-audit --no-fund --fetch-retries=5 --maxsockets=4 --workspace=@nippia/shared --workspace=@nippia/api \
  && npm install --no-save --no-audit --no-fund prisma@^6.5.0

COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R node:node /app
USER node

EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/ready').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && npm run start --workspace=@nippia/api"]
