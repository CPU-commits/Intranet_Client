# STAGE 0 -> Builder
FROM node:18.14.2-alpine3.17 as installer

WORKDIR /app

COPY . .

RUN npm install

RUN npx nuxi build

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT [ "node", ".output/server/index.mjs" ]
