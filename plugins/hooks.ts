// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode'
import { DefaultResponse } from '~~/common/fetchModule'
/* type ErrorMessage = {
	message: string
}

function messageInError(err: unknown): err is ErrorMessage {
	return typeof err === 'object' && err !== null && 'message' in err
} */

import { AuthData } from '~~/stores/useAuthStore'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.hook('app:created', () => {
		setInterval(async () => {
			if (process.client) {
				const { session, refresh, overwrite, reset, remove } =
					await useSession<AuthData | undefined>()
				await refresh()

				if (
					session.value?.data?.refresh_token &&
					session.value?.data?.access_token &&
					session.value?.data?.user
				) {
					const data: AuthData = {
						refresh_token: session.value.data.refresh_token,
						access_token: session.value.data.access_token,
						user: session.value.data.user,
					}
					const decodedToken = jwt_decode<{ iat: number }>(
						data.access_token,
					)
					const date = new Date(decodedToken.iat * 1000)
					// Add 2 hours -> Is expiration
					date.setHours(date.getHours() + 2)

					const now = new Date()
					now.setMinutes(now.getMinutes() + 22)
					// Flag
					let flag = true
					if (dateIsAfter(now, date)) {
						try {
							const dataFetch =
								await nuxtApp.vueApp.$nuxt.$fetchModule.fetchData<
									{ access_token: string } & DefaultResponse
								>({
									URL: `/api/authentication/refresh`,
									method: 'get',
									headers: {
										refresh_token: data.refresh_token,
									},
								})
							data.access_token = dataFetch.access_token
						} catch (err) {
							flag = false
							await remove()
						}
					}
					if (flag) {
						await reset()
						await overwrite(data)

						useAuthStore().setAuth(data)
					} else {
						useToastsStore().addToast({
							message: 'La sesión se ha acabado',
							type: 'error',
						})
						useAuthStore().unsetAuth()
						useRouter().push('/')
					}
				}
			}
		}, 1500000)
	})
	/* nuxtApp.hook('vue:error', (err, _, info) => {
		if (messageInError(err)) {
			nuxtApp.vueApp.$nuxt.$logger.error({
				message: `${info} ${err.message}`,
				context: 'vue:error',
				labels: ['vue', 'client'],
			})
		} else {
			nuxtApp.vueApp.$nuxt.$logger.error({
				message: `${info}`,
				context: 'vue:error',
				labels: ['vue', 'client'],
			})
		}
	})
	nuxtApp.hook('app:error', (err) => {
		if (messageInError(err)) {
			nuxtApp.vueApp.$nuxt.$logger.error({
				message: `${err.message}`,
				context: 'vue:error',
				labels: ['vue', 'client'],
			})
		} else {
			nuxtApp.vueApp.$nuxt.$logger.error({
				message: err,
				context: 'vue:error',
				labels: ['vue', 'client'],
			})
		}
	}) */
})
