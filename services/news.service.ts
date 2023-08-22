import { DefaultResponse, Fetch } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { News } from '~~/models/news/news.model'

export class NewsService {
	private readonly authStore = useAuthStore()
	private readonly toastStore = useToastsStore()
	private readonly fetch: Fetch
	private readonly LIMIT = 10

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	async getNews(limit?: number, total = false, skip?: number, type?: string) {
		let URL = '/api/news/get_news'
		if (limit) URL += `?limit=${limit}`
		else URL += `?limit=${this.LIMIT}`
		if (total) URL += `&total=${total}`
		if (skip) URL += `&skip=${skip}`
		if (type) URL += `&type=${type}`

		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				news?: Array<News>
				total?: number
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return {
			news: dataFetch.body?.news ?? [],
			total: dataFetch.body?.total ?? 0,
		}
	}

	async getSingleNews(idNews: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				news: News
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/news/get_single_news/${idNews}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.news
	}

	private validatorsNews(
		news:
			| {
					title: string
					headline: string
					body: string
			  }
			| News,
		files: FileList | null,
		edit = false,
	) {
		if (news.title.length < 3 || news.title.length > 100)
			throw new Error('Debe existir un titulo de mín 3 cárac. y máx 100')
		if (news.headline.length < 3 || news.headline.length > 500)
			throw new Error('Debe existir una bajada de mín 3 cárac. y máx 500')
		if (!edit && (!files || files.length === 0))
			throw new Error('Debe seleccionar una imagen')
		if (news.body.length < 10)
			throw new Error('Debe existir un cuerpo de mín 10 cárac.')
	}

	private buildForm(
		news:
			| {
					title: string
					headline: string
					body: string
			  }
			| News,
		files: FileList | null,
	) {
		const form = new FormData()
		if (news.title) form.append('title', news.title)
		if (news.headline) form.append('headline', news.headline)
		if (news.body) form.append('body', news.body)
		if (files && files[0]) form.append('img', files[0])
		return form
	}

	async publishNews(
		news: {
			title: string
			headline: string
			body: string
		},
		files: FileList | null,
	) {
		try {
			this.validatorsNews(news, files)
			await this.fetch.fetchData({
				method: 'post',
				URL: '/api/news/new_news',
				body: this.buildForm(news, files),
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				type: 'success',
				message: 'Se ha subido la noticia exitosamente',
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

	async updateNews(news: News, files: FileList | null, idNews: string) {
		try {
			this.validatorsNews(news, files, true)
			await this.fetch.fetchData({
				method: 'put',
				URL: `/api/news/update_news/${idNews}`,
				body: this.buildForm(news, files),
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				type: 'success',
				message: 'Se ha actualizado la noticia exitosamente',
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

	async likeNews(like: boolean, idNews: string) {
		try {
			await this.fetch.fetchData({
				method: 'post',
				URL: `/api/news/like_news/${idNews}`,
				token: this.authStore.getToken,
			})

			return true
		} catch (err) {
			let message: string
			if (like === true) {
				message = 'No se ha podido dar me gusta a la noticia'
			} else {
				message = 'No se ha podido quitar el me gusta a la noticia'
			}
			this.toastStore.addToast({
				message,
				type: 'error',
			})
			return false
		}
	}

	async deleteNews(idNews: string) {
		try {
			await this.fetch.fetchData({
				URL: `/api/news/delete_news/${idNews}`,
				method: 'delete',
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha eliminado la noticia exitosamente',
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
