// Fetch
import { validateBody, Type } from 'h3-typebox'
import { DefaultResponse } from '~~/common/fetchModule'
// Server
import { cookieConfig, setCookieSession } from '~~/server/common/cookie'
// Types
import type { AuthData } from '~~/stores/useAuthStore'

export default defineEventHandler(async (event) => {
	try {
		const body = await validateBody(
			event,
			Type.Object({
				rut: Type.String(),
				password: Type.String(),
			}),
		)
		/* useNuxtApp().$logger.info({
			context: 'nitro:server',
			message: `User ${body.rut} try to login`,
			labels: ['nitro', 'login'],
		}) */
		// Get authData
		const dataFetch = await $fetch<AuthData & DefaultResponse>(
			'api/authentication',
			{
				body,
				method: 'post',
				baseURL: useRuntimeConfig().public.API,
			},
		)
		// Set session in Redis
		const idSession = await setCookieSession(dataFetch)
		// Set cookie
		setCookie(event, 'INT_SESSION', idSession, cookieConfig(0))
		// Return response
		/* useNuxtApp().$logger.info({
			context: 'nitro:server',
			message: `Success login ${body.rut}`,
		}) */
		return dataFetch
	} catch (err) {
		throw createError(err as Error)
	}
})
