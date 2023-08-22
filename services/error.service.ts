import { ErrorFetch, Fetch } from '@/common/fetchModule'

export class ErrorService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly fetch: Fetch

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	async uploadReport(
		report: { description?: string; type: string },
		error?: ErrorFetch,
	) {
		try {
			await this.fetch.fetchData({
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
			const error = this.fetch.handleError(err, false)
			this.toastsStore.addToast({
				message: error.message,
				type: 'error',
			})

			return false
		}
	}
}
