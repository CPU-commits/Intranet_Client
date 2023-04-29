import { COOKIE_SESSION } from '~/common/cookies'

export default defineEventHandler(async (event) => {
	const cookieSession = getCookie(event, COOKIE_SESSION)
	if (!cookieSession)
		return {
			success: true,
		}

	// Descrypt and send session
	const decryptedIdRedis = decrypt(cookieSession)

	await redis.del(decryptedIdRedis)
	deleteCookie(event, COOKIE_SESSION)

	return {
		success: true,
	}
})
