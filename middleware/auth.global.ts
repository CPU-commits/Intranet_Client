export default defineNuxtRouteMiddleware(async (_to, from) => {
	if (useError().value || process.server) return
	let isAuth = true
	if (!useAuthStore().isAuth) {
		const { session } = await useSession()
		if (session.value?.access_token) {
			useAuthStore().setAuth({
				access_token: session.value.access_token,
				refresh_token: session.value.refresh_token,
				user: session.value.user,
			})
		} else isAuth = false
	}
	const auth = _to.meta?.auth ?? true
	if (auth && !isAuth)
		return navigateTo({
			path: '/',
			query: {
				redirect: from.path,
			},
		})
})
