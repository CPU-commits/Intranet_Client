import { DefaultResponse, Fetch } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { Annoucement } from '~~/models/home/annoucement.model'

export class HomeService {
	private readonly authStore = useAuthStore()
	private readonly toastStore = useToastsStore()
	private readonly fetch: Fetch

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	async getAnnoucements(total = false, skip = 0, limit = 20) {
		const query = `?total=${total}&skip=${skip}&limit=${limit}`
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				annoucements: Array<Annoucement> | null
				total: number
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/annoucements/get_annoucements${query}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body
	}

	async uploadAnnoucement(annoucement: string, files: Array<string>) {
		try {
			const dataFetch = await this.fetch.fetchData<
				BodyFetch<{
					_id: string
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: `/api/annoucements/upload_annoucement`,
				body: {
					annoucement,
					files,
				},
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			// Notify
			this.toastStore.addToast({
				message: 'Se ha publicado el anuncio exitosamente',
				type: 'success',
			})

			return dataFetch.body._id
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async deleteAnnoucement(idAnnoucement: string) {
		try {
			await this.fetch.fetchData({
				method: 'delete',
				URL: `/api/annoucements/delete_annoucement/${idAnnoucement}`,
				token: this.authStore.getToken,
				spinnerStatus: true,
			})
			this.toastStore.addToast({
				message: 'Se ha eliminado el anuncio exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}
}
