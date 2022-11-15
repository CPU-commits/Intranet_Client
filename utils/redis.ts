// Redis
import { createClient } from 'redis'

export async function createClientRedis() {
	const user = process.env.NUXT_REDIS_USER
	const password = process.env.NUXT_REDIS_PASSWORD
	const host = process.env.NUXT_REDIS_HOST
	const port = process.env.NUXT_REDIS_PORT

	const uri = `redis://${user}:${password}@${host}:${port}`
	const client = createClient({
		url: uri,
	})
	await client.connect()
	return client
}
