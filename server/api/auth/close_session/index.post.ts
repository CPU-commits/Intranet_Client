// Fetch
export default defineEventHandler((event) => {
	try {
		const idSession = getCookie(event, 'INT_SESSION')
		if (!idSession)
			throw createError({
				statusCode: 401,
				message: 'No cookie',
			})
		deleteCookie(event, 'INT_SESSION')

		return {
			success: true,
		}
	} catch (err) {
		const { $fetchModule } = useNuxtApp()
		const _err = $fetchModule.handleError(err)
		throw createError({
			..._err,
		})
	}
})
