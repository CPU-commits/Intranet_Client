import { DefaultResponse } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { Publication } from '~~/models/classroom/publication.model'
import { Attached, AttachedType } from '~~/models/file/attached.model'
import { UserFile } from '~~/models/file/file.model'

export class PublicationsService {
	private readonly authStore = useAuthStore()
	private readonly toastStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()

	async getPublications(idModule: string, section: number, query: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				publications?: Array<Publication>
				total: number
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/publications/get_publications/${idModule}?section=${section}${query}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return {
			publications: dataFetch.body.publications ?? [],
			total: dataFetch.body.total,
		}
	}

	async getPublication(idModule: string, idPublication: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				publication: Publication
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/classroom/publications/get_publication/${idModule}/${idPublication}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body.publication
	}

	async uploadPublication(
		text: string,
		linksAttached: Array<{
			title: string
			link: string
		}>,
		filesAttached: Array<UserFile>,
		idModule: string,
		section: number,
	) {
		try {
			if (text.length < 3)
				throw new Error('El texto debe tener mín. 3 cárac.')
			const attached = [
				...linksAttached.map((link) => {
					return {
						type: 'link',
						link: link.link,
						title: link.title,
					}
				}),
				...filesAttached.map((file) => {
					return {
						type: 'file',
						file: file._id.$oid,
					}
				}),
			]
			const data = {
				content: text,
				attached,
			}
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					_id: string
					attached_ids: Array<string>
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: `/api/c/classroom/publications/upload/${idModule}?section=${section}`,
				body: data,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha creado la publicación exitosamente',
				type: 'success',
			})
			return {
				_id: dataFetch.body?._id ?? '',
				attached: attached.map((att, i) => {
					const type = att.type as keyof typeof AttachedType
					if (type === 'link') {
						const attachedLink = att as {
							title: string
							link: string
						}
						return {
							type,
							_id: dataFetch.body?.attached_ids[i] ?? [],
							link: attachedLink.link,
							title: attachedLink.title,
						} as Attached
					} else {
						return {
							type,
							_id: dataFetch.body?.attached_ids[i] ?? [],
							file: filesAttached[i - linksAttached.length],
						} as Attached
					}
				}),
				update_date: new Date(),
				upload_date: new Date(),
				content: {
					author: this.authStore.getName as string,
					content: text,
				},
			}
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async editPublication(idPublication: string, publication: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'put',
				URL: `/api/c/classroom/publications/update/${idPublication}`,
				body: { content: publication },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha actualizado la publicación exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async deletePublication(idPublication: string, idModule: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/publications/delete/${idPublication}/${idModule}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha eliminado exitosamente la publicación',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async deleteAttached(id: string, idModule: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/publications/delete_attached/${id}/${idModule}`,
				token: this.authStore.getToken,
				spinnerStatus: true,
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}
}
