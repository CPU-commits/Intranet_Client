import { COOKIE_SESSION } from '~/common/cookies'
import { setSession } from '~/server/utils/cookies'

export default defineEventHandler(async (event) => {
	const cookieSession = getCookie(event, COOKIE_SESSION)
	if (!cookieSession) return {}

	// Descrypt and send session
	const decryptedIdRedis = decrypt(cookieSession)

	// Extend session
	const session = (await redis.get(decryptedIdRedis)) as string

	return await setSession(decryptedIdRedis, session, event)
})
