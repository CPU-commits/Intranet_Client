// Fetch
import { validateBody, Type } from 'h3-typebox'
import { DefaultResponse } from '~~/common/fetchModule'
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

		return dataFetch
	} catch (err) {
		throw createError(err as Error)
	}
})
