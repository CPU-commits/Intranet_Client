import { serialize } from 'object-to-formdata'
import { DefaultResponse, Fetch } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { UserFile } from '~~/models/file/file.model'

export class FilesService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly fetch: Fetch

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	blobPartToUrl(part: BlobPart, type: string) {
		const blob = new Blob([part], { type })
		const url = window.URL.createObjectURL(blob)
		return url
	}

	async importExcelData(
		file: File,
		sheets: Array<string>,
		transformer?: Array<{ key: string; value: string }>,
	) {
		const formData = serialize({
			sheets,
		})
		formData.append('file', file)
		// Set transformer
		transformer?.forEach((trans, i) => {
			formData.append(`transformer[${i}][key]`, trans.key)
			formData.append(`transformer[${i}][value]`, trans.value)
		})

		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				excelData: [
					{
						sheet: string
						values: Array<object>
					},
				]
			}> &
				DefaultResponse
		>({
			method: 'post',
			URL: '/api/files/excel',
			spinnerStatus: true,
			token: this.authStore.getToken,
			body: formData,
		})

		return dataFetch.body
	}

	async getFiles() {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<Array<UserFile> | null> & DefaultResponse
		>({
			method: 'get',
			URL: '/api/files/get_files',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body ?? []
	}

	async downloadFile(idFile: string, justDownload = false) {
		try {
			const dataFetch = await this.fetch.fetchData<
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

			if (justDownload) this.downloadFileUrl(dataFetch.body.token)
			return dataFetch.body.token
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async downloadFileClassroom(idFile: string, idModule: string) {
		try {
			const dataFetch = await this.fetch.fetchData<
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
			const _err = this.fetch.handleError(err)
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
			form.append('title', fileForm.title)
			// Send request
			const dataFetch = await this.fetch.fetchData<
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
			const _err = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async deleteFile(idFile: string) {
		try {
			await this.fetch.fetchData({
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
			const _err = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async changePermissions(permissions: string, idFile: string) {
		try {
			await this.fetch.fetchData({
				method: 'put',
				URL: `/api/files/change_permissions/${idFile}`,
				body: { permissions },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			return true
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}
}
