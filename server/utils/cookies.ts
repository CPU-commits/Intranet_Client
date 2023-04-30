import dayjs from 'dayjs'
import { H3Event } from 'h3'
import { COOKIE_SESSION } from '~/common/cookies'

export async function setSession(
	idRedisSession: string,
	session: string,
	event: H3Event,
) {
	// Redis set session
	const {
		cookies: { EXPIRY_IN_SECONDS },
	} = useRuntimeConfig()
	await redis.setex(idRedisSession, EXPIRY_IN_SECONDS + 60, session)

	// Set cookie
	const url = new URL(
		event.node.req.url ?? '',
		`http://${event.node.req.headers.host}`,
	)
	setCookie(event, COOKIE_SESSION, encrypt(idRedisSession), {
		domain: url.hostname,
		expires: dayjs().add(EXPIRY_IN_SECONDS, 'seconds').toDate(),
		httpOnly: true,
		path: '/',
		sameSite: 'strict',
		secure: !process.dev,
	})

	return {
		success: true,
	}
}
