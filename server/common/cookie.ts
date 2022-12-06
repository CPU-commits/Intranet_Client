// Types
import type { CookieOptions } from 'nuxt/dist/app/composables'
// Uuid
import { v4 as uuidv4 } from 'uuid'
// Imports
import { createClientRedis } from '../../utils/redis'

const config = useRuntimeConfig()

export function cookieConfig(maxAge: number): CookieOptions {
	return {
		maxAge: config.public.NODE_ENV === 'dev' ? undefined : maxAge,
		httpOnly: true,
		secure: config.public.NODE_ENV !== 'dev',
		path: '/',
		sameSite: 'lax',
	}
}

export async function setCookieSession(userData: any) {
	const id = `id_session_${uuidv4()}`
	const redisClient = await createClientRedis()
	await redisClient.set(
		id,
		JSON.stringify({
			...userData,
			token: userData.access_token,
		}),
	)
	return id
}
