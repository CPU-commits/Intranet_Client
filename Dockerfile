# STAGE 0 -> Builder
FROM node:16.18.1-alpine3.16 as installer

WORKDIR /app

COPY package*.json ./

RUN npm install
# STAGE 1 -> Nuxt build
FROM node:16.18.1-alpine3.16 as builder

WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules

COPY . .

RUN npm run build

# STAGE 2 -> Nuxt entrypoint
FROM node:16.18.1-alpine3.16

WORKDIR /app

COPY --from=builder /app/.output ./.output

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD [ "NUXT_REDIS_USER=default", "NUXT_REDIS_PASSWORD=MwbcLVGCRi6OFrBQypH_xw", "NUXT_REDIS_HOST=redis", "NUXT_REDIS_PORT=6379", "node", ".output/server/index.mjs" ]
