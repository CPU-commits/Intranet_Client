// eslint-disable-next-line import/no-named-as-default
import Redis from 'ioredis'

const { redis } = useRuntimeConfig()

// eslint-disable-next-line import/no-mutable-exports
let redisClient: Redis
if (process.env.IS_BUILDING === 'building')
	redisClient = {
		get(_key: any, _callback?: any): any {
			return null
		},
		del(..._args: [...keys: any[], callback: any]): any {
			return 0
		},
		setex(
			_key: any,
			_seconds: number | string,
			_value: string | Buffer | number,
			_callback?: any,
		): any {
			return 'OK'
		},
	} as Redis
else
	redisClient = new Redis({
		port: redis.port,
		host: redis.host,
		username: redis.user,
		password: redis.password,
		db: 0,
	})

export default redisClient
