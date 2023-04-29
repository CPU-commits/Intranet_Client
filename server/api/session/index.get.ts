import { COOKIE_SESSION } from '~/common/cookies'
import { Session } from '~/models/session/session'

export default defineEventHandler(async (event): Promise<Session | null> => {
	const cookieSession = getCookie(event, COOKIE_SESSION)
	if (!cookieSession) return null

	// Descrypt and send session
	const decryptedIdRedis = decrypt(cookieSession)

	const session = await redis.get(decryptedIdRedis)
	if (!session) return null

	return JSON.parse(session as string) as Session
})
