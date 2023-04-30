import { ErrorFetch } from '@/common/fetchModule'

export class ErrorService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()

	async uploadReport(
		report: { description?: string; type: string },
		error?: ErrorFetch,
	) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				URL: '/api/reports',
				method: 'post',
				body: {
					report,
					error,
				},
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Reporte hecho exitosamente',
				type: 'success',
			})

			return true
		} catch (err) {
			const error = this.nuxtApp.$fetchModule.handleError(err, false)
			this.toastsStore.addToast({
				message: error.message,
				type: 'error',
			})

			return false
		}
	}
}
