import { DefaultResponse } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { AnyUser } from '~~/models/user/user.model'

export class UserService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()

	async getUserData() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				user: AnyUser
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/users/get_data',
			token: this.authStore.getToken,
			spinnerStatus: true,
		})
		return dataFetch.body.user
	}

	async changeEmail(email: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: '/api/users/change_email',
				body: { email },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha actualizado el email correctamente',
				type: 'success',
			})
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}
}
