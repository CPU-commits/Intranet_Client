import { DefaultResponse } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { UserFile } from '~~/models/file/file.model'

export class FilesService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()

	blobPartToUrl(part: BlobPart, type: string) {
		const blob = new Blob([part], { type })
		const url = window.URL.createObjectURL(blob)
		return url
	}

	async getFiles() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<Array<UserFile>> & DefaultResponse
		>({
			method: 'get',
			URL: '/api/files/get_files',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body
	}

	async downloadFile(idFile: string) {
		try {
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					token: string
				}> &
					DefaultResponse
			>({
				method: 'get',
				URL: `/api/files/get_file/${idFile}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})

			return dataFetch.body.token
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async downloadFileClassroom(idFile: string, idModule: string) {
		try {
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					token: string
				}> &
					DefaultResponse
			>({
				method: 'get',
				URL: `/api/c/classroom/modules/download_file/${idFile}/${idModule}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			return dataFetch.body.token
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	downloadFileUrl(url: string, filename?: string) {
		const link = document.createElement('a')
		document.body.appendChild(link)
		if (filename) link.download = filename
		link.href = url
		link.click()
		document.body.removeChild(link)
	}

	private validatorsFile(
		files: FileList | null,
		fileForm: { title: string },
	) {
		if (!files || files.length === 0)
			throw new Error('Debe seleccionar un archivo')
		if (fileForm.title === '' || fileForm.title.length > 100)
			throw new Error('Debe existir un titulo con máx. 100 cárac.')
	}

	async uploadFile(files: FileList | null, fileForm: { title: string }) {
		try {
			this.validatorsFile(files, fileForm)
			// Generate form
			const form = new FormData()
			if (files) form.append('file', files[0])
			// Send request
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<UserFile> & DefaultResponse
			>({
				method: 'post',
				URL: '/api/files/upload_file',
				body: form,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha el archivo exitosamente',
				type: 'success',
			})

			return dataFetch.body
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async deleteFile(idFile: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				spinnerStatus: true,
				token: this.authStore.getToken,
				URL: `/api/files/delete_file/${idFile}`,
			})
			this.toastsStore.addToast({
				message: 'Se ha eliminado el archivo exitosamente',
				type: 'success',
			})

			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async changePermissions(permissions: string, idFile: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'put',
				URL: `/api/files/change_permissions/${idFile}`,
				body: { permissions },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}
}
