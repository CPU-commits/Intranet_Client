
# Client - Intranet

Client PWA - SSR in Nuxt 3
## Installation

### Docker

`Dockerfile` **Only for production** 

Exposed port: `3000`

## Volumes

- Logs: /app/logs

## Environment Variables

| Variable              | Description                | Required     | Access  |
| :-------------------- | :--------------------------| :------------| :-------|
| `NUXT_REDIS_USER`     | Redis User                 | **Required** | Private |
| `NUXT_REDIS_HOST`     | Redis Host                 | **Required** | Private |
| `NUXT_REDIS_PORT`     | Redis Port                 | **Required** | Private |
| `NUXT_REDIS_PASSWORD` | Redis Password             | **Required** | Private |
| `API`                 | Public API Base URL        | **Required** | Public  |
| `NODE_ENV`            | env - prod                 | **Required** | Public  |
| `WS`                  | Public WebSocket Base URL  | **Required** | Public  |
| `COLLEGE_NAME`        | College Name               | **Required** | Public  |
| `COLLEGE_SHORT_NAME`  | College Short name         | **Required** | Public  |
| `CLIENT_URL`          | Client URL                 | **Required** | Public  | 
