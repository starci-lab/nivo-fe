# Build from the monorepo root:
#   docker build -f apps/app/Dockerfile --build-arg NEXT_PUBLIC_CORE_API_URL=https://api.staging.nivo.vn/graphql -t nivo-app:<tag> .
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/app/package.json apps/app/package.json
COPY apps/expert/package.json apps/expert/package.json
COPY apps/landing/package.json apps/landing/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN npm ci

COPY turbo.json ./
COPY apps/app apps/app
COPY packages/ui packages/ui

ARG NEXT_PUBLIC_CORE_API_URL
ARG NEXT_PUBLIC_ACADEMY_HOST_SUFFIX=.nivo.vn
ENV NEXT_PUBLIC_CORE_API_URL=${NEXT_PUBLIC_CORE_API_URL}
ENV NEXT_PUBLIC_ACADEMY_HOST_SUFFIX=${NEXT_PUBLIC_ACADEMY_HOST_SUFFIX}
RUN npm run build -w @nivo/app

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3067
ENV HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/apps/app/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/app/.next/static ./apps/app/.next/static
COPY --from=build --chown=node:node /app/apps/app/public ./apps/app/public

USER node
EXPOSE 3067
CMD ["node", "apps/app/server.js"]
