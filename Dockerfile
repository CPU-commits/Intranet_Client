# STAGE 0 -> Builder
FROM node:16.18.1-alpine3.16 as builder

WORKDIR /app

COPY package*.json ./

RUN npm install
# STAGE 1 -> Nuxt build
FROM node:16.18.1-alpine3.16

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY . .

ENV HOST=0.0.0.0
ENV PORT=3000

RUN npm run build

EXPOSE 3000

CMD [ "node", ".output/server/index.mjs" ]
