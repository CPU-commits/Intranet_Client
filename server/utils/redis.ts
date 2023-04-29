// eslint-disable-next-line import/no-named-as-default
import Redis from 'ioredis'

const { redis } = useRuntimeConfig()

export default new Redis({
	port: redis.port,
	host: redis.host,
	username: redis.user,
	password: redis.password,
	db: 0,
})
