import useAuthStore from '~~/stores/useAuthStore'

const PUBLIC_URLS = ['/']

function inPublicPath(path: string) {
	return PUBLIC_URLS.includes(path)
}

export default defineNuxtRouteMiddleware(async (_to, from) => {
	if (useError().value) {
		return
	}

	const cookie = useCookie('INT_SESSION')
	const auth = useAuthStore()

	if (process.server && !cookie.value) {
		auth.unsetAuth()

		if (!inPublicPath(from.path))
			return navigateTo({
				path: '/',
				query: {
					redirect: from.path,
				},
			})
	} else if (process.server && cookie.value && !auth.getIsAuth) {
		const { createClientRedis } = await import('~~/utils/redis')

		const idSession = cookie.value
		try {
			const redisClient = await createClientRedis()
			const session = await redisClient.get(idSession)

			if (session) {
				auth.setAuth(JSON.parse(session))
			} else {
				throw new Error('No session')
			}
		} catch (err) {
			auth.unsetAuth()

			if (!inPublicPath(from.path))
				return navigateTo({
					path: '/',
					query: {
						redirect: from.path,
					},
				})
		}
	}
})
