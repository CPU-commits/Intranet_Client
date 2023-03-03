import type { FilesService } from './files.service'
import { DefaultResponse } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { FormAccess } from '~~/models/classroom/form_access.model'
import { Grade } from '~~/models/classroom/grade.model'
import { StudentAccess } from '~~/models/classroom/students_access.model'
import { Work, WorkBuild } from '~~/models/classroom/work.model'
import { UserFile } from '~~/models/file/file.model'
import { FilesUploadedClassroom } from '~~/models/file/files_uploaded.model'
import { formatDateUTC } from '~~/utils/format'

export class WorkService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()
	private readonly filesService: FilesService

	constructor(filesServices: FilesService) {
		this.filesService = filesServices
	}

	async getWorks(idModule: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				works?: Array<Work>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/works/get_works/${idModule}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body.works ?? []
	}

	async getWork(idWork: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				work: Work
				files_uploaded: FilesUploadedClassroom
				form_access: FormAccess
				form_has_points: boolean
				grade: Grade
			}> &
				DefaultResponse
		>({
			method: 'get',
			spinnerStatus: true,
			URL: `/api/c/classroom/works/get_work/${idWork}`,
			token: this.authStore.getToken,
		})

		return dataFetch.body
	}

	async getModulesWork() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				works: Array<Work & { status: number }>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/c/classroom/works/get_modules_works',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body.works
	}

	async getStudentsStatus(idModule: string, idWork: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				students: Array<StudentAccess>
				total_points: number
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/works/get_students_status/${idModule}/${idWork}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body
	}

	async downloadFiles(idStudent: string, idWork: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BlobPart & DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/works/download_files_work_student/${idWork}/${idStudent}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
			headers: {
				'content-type': 'application/json',
			},
			responseType: 'blob',
		})
		return this.filesService.blobPartToUrl(
			dataFetch,
			'application/octet-stream',
		)
	}

	async deleteWork(idWork: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/works/delete_work/${idWork}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha eliminado el trabajo exitosamente',
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

	private validateWork(work: WorkBuild) {
		if (work.title === '' || work.title.length > 100)
			throw new Error('El titlo del trabajo debe ser de máx. 100 cárac.')
		if (work.description && work.description?.length > 150)
			throw new Error(
				'La descripción del trabajo debe ser de máx. 150 cárac.',
			)
		if (work.is_qualified === '')
			throw new Error('Debe seleccionar una calificación de trabajo')
		if (work.is_qualified === 'true' && work.grade === '')
			throw new Error('Debe seleccionar una calificación asignada')
		if (work.type === '')
			throw new Error('Debe seleccionar un tipo de trabajo')
		if (work.type === 'form' && work.form === '')
			throw new Error('Debe seleccionar un formulario asignado')
		if (work.type === 'files') {
			if (work.pattern.length === 0)
				throw new Error('La pauta debe tener mín. 1 item')
			work.pattern.forEach((item, i) => {
				if (item.title === '' || item.title.length > 100)
					throw new Error(
						`El titulo ${
							i + 1
						} de la pauta debe ser de máx. 100 cárac.`,
					)
				if (item.description === '' || item.description.length > 300)
					throw new Error(
						`La descripción ${
							i + 1
						} de la pauta debe ser de máx. 300 cárac.`,
					)
				if (
					Number(item.points) < 0 ||
					!Number.isInteger(Number(item.points))
				)
					throw new Error(
						`El puntaje ${
							i + 1
						} de la pauta debe ser entero y mayor a cero`,
					)
			})
		}
		if (work.date_start === '')
			throw new Error('Debe indicar una fecha inicio de acceso')
		if (work.time_start === '')
			throw new Error('Debe indicar un tiempo inicio de acceso')
		if (work.date_limit === '')
			throw new Error('Debe indicar una fecha límite de acceso')
		if (work.time_limit === '')
			throw new Error('Debe indicar un tiempo límite de acceso')
		if (
			work.type === 'form' &&
			work.time_access === '' &&
			work.form_access === 'wtime'
		)
			throw new Error(
				'Debe indicar un tiempo límite de acceso al formulario',
			)
	}

	async uploadWork(
		newWork: WorkBuild,
		filesAttached: Array<UserFile>,
		linksAttached: Array<{
			title: string
			link: string
		}>,
		idModule: string,
	) {
		try {
			this.validateWork(newWork)

			const work: any = {
				title: newWork.title,
				is_qualified: newWork.is_qualified === 'true',
				type: newWork.type,
				date_start: formatDateUTC(
					new Date(`${newWork.date_start} ${newWork.time_start}`),
				),
				date_limit: formatDateUTC(
					new Date(`${newWork.date_limit} ${newWork.time_limit}`),
				),
			}
			if (newWork.description !== '')
				work.description = newWork.description
			if (filesAttached.length > 0 || linksAttached.length > 0)
				work.attached = [
					...filesAttached.map((file) => {
						return {
							type: 'file',
							file: getFileID(file._id),
						}
					}),
					...linksAttached.map((link) => {
						return {
							type: 'link',
							link: link.link,
							title: link.title,
						}
					}),
				]
			if (newWork.is_qualified === 'true') work.grade = newWork.grade
			if (newWork.type === 'form') {
				work.form = newWork.form
				work.form_access =
					newWork.form_access === '' ? 'default' : newWork.form_access
				if (work.form_access === 'wtime') {
					const splitTime = newWork.time_access.split(':')
					work.time_access =
						parseInt(splitTime[0]) * 60 ** 2 +
						parseInt(splitTime[1]) * 60
				}
			}
			if (newWork.type === 'files')
				work.pattern = newWork.pattern.map((item) => {
					return {
						...item,
						points: Number(item.points),
					}
				})
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/c/classroom/works/upload_work/${idModule}`,
				body: work,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha publicado el trabajo exitosamente',
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

	private validateWorkEdit(
		work: Work,
		dates: {
			start_date: string
			start_hour: string
			limit_date: string
			limit_hour: string
		},
		timeAccess: string,
	) {
		if (work.title === '' || work.title.length > 100)
			throw new Error('El titlo del trabajo debe ser de máx. 100 cárac.')
		if (work.description && work.description.length > 150)
			throw new Error(
				'La descripción del trabajo debe ser de máx. 150 cárac.',
			)
		if (work.is_qualified && work.grade._id === '')
			throw new Error('Debe seleccionar una calificación asignada')
		if (work.type === 'form' && work.form === '')
			throw new Error('Debe seleccionar un formulario asignado')
		if (work.type === 'files') {
			if (work.pattern.length === 0)
				throw new Error('La pauta debe tener mín. 1 item')
			work.pattern.forEach((item, i) => {
				if (item.title === '' || item.title.length > 100)
					throw new Error(
						`El titulo ${
							i + 1
						} de la pauta debe ser de máx. 100 cárac.`,
					)
				if (item.description === '' || item.description.length > 300)
					throw new Error(
						`La descripción ${
							i + 1
						} de la pauta debe ser de máx. 300 cárac.`,
					)
				if (
					Number(item.points) < 0 ||
					!Number.isInteger(Number(item.points))
				)
					throw new Error(
						`El puntaje ${
							i + 1
						} de la pauta debe ser entero y mayor a cero`,
					)
			})
		}
		if (dates.start_date === '')
			throw new Error('Debe indicar una fecha inicio de acceso')
		if (dates.start_hour === '')
			throw new Error('Debe indicar un tiempo inicio de acceso')
		if (dates.limit_date === '')
			throw new Error('Debe indicar una fecha límite de acceso')
		if (dates.limit_hour === '')
			throw new Error('Debe indicar un tiempo límite de acceso')
		if (
			work.type === 'form' &&
			timeAccess === '' &&
			work.form_access === 'wtime'
		)
			throw new Error(
				'Debe indicar un tiempo límite de acceso al formulario',
			)
	}

	private buildDataUpdateWork(
		work: Work,
		dates: {
			start_date: string
			start_hour: string
			limit_date: string
			limit_hour: string
		},
		timeAccess: string,
		filesAttached: Array<UserFile>,
		linksAttached: Array<{
			title: string
			link: string
			_id_attached?: string
		}>,
	) {
		const splitTime = timeAccess.split(':')
		return {
			title: work.title,
			description: work.description,
			grade: work.grade._id,
			form: work.form,
			pattern: work.pattern?.map((item) => {
				return {
					...item,
					points: Number(item.points),
				}
			}),
			form_access: work.form_access,
			attached: [
				...filesAttached.map((file) => {
					return {
						file: getFileID(file._id),
						type: 'file',
					}
				}),
				...linksAttached.map((link) => {
					return { link: link.link, title: link.title, type: 'link' }
				}),
			],
			time_access:
				work.type === 'form' && work.form_access === 'wtime'
					? parseInt(splitTime[0]) * 60 ** 2 +
					  parseInt(splitTime[1]) * 60
					: undefined,
			date_start: formatDateUTC(
				new Date(`${dates.start_date} ${dates.start_hour}`),
			),
			date_limit: formatDateUTC(
				new Date(`${dates.limit_date} ${dates.limit_hour}`),
			),
		}
	}

	async updateWork(
		work: Work,
		dates: {
			start_date: string
			start_hour: string
			limit_date: string
			limit_hour: string
		},
		timeAccess: string,
		filesAttached: Array<UserFile>,
		linksAttached: Array<{
			title: string
			link: string
			_id_attached?: string
		}>,
	) {
		try {
			this.validateWorkEdit(work, dates, timeAccess)
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'put',
				URL: `/api/c/classroom/works/update_work/${work._id}`,
				body: this.buildDataUpdateWork(
					work,
					dates,
					timeAccess,
					filesAttached,
					linksAttached,
				),
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha actualizado el trabajo exitosamente',
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

	async uploadEvaluateFiles(
		data: Array<{
			pattern: string
			points: number
		}>,
		isRevised: boolean,
		idStudent: string,
		idWork: string,
	) {
		try {
			const route = !isRevised
				? 'upload_evaluate_files'
				: 'upload_reevaluate_files'

			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/c/classroom/works/${route}/${idWork}/${idStudent}`,
				body: data,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha evaluado al alumno exitosamente',
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

	async uploadFiles(filesStored: Array<File>, idWork: string) {
		try {
			if (filesStored.length === 0)
				throw new Error('Debes seleccionar mín. 1 archivo a subir')
			const form = new FormData()
			filesStored.forEach((file) => {
				form.append('files[]', file)
			})
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/c/classroom/works/upload_files/${idWork}`,
				body: form,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se han subido los archivos exitosamente',
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

	async deleteItem(idWork: string, idItem: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/works/delete_item_pattern/${idWork}/${idItem}`,
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

	async deleteFile(idAttached: string, idWork: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/works/delete_attached/${idWork}/${idAttached}`,
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

	async deleteLink(idAttached: string, idWork: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/works/delete_attached/${idWork}/${idAttached}`,
				token: this.authStore.getToken,
				spinnerStatus: true,
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

	async deleteFileWork(id: string, idWork: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/works/delete_file_work/${idWork}/${id}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
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
}
