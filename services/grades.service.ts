// Types
import type { FilesService } from './files.service'
import type { DefaultResponse, Fetch } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { GradeProgram } from '~~/models/classroom/grade.model'
import { GradeSee, StudentGrade } from '~~/models/classroom/student_grade.model'

export class GradesService {
	private readonly authStore = useAuthStore()
	private readonly toastStore = useToastsStore()
	private readonly fetch: Fetch
	private readonly filesService: FilesService

	constructor(fetch: Fetch, filesServices: FilesService) {
		this.fetch = fetch
		this.filesService = filesServices
	}

	async getGradeConfig() {
		const dataFetch = await this.fetch.fetchData<
			{
				body: {
					gradeConfig: {
						min: string
						max: string
					}
				}
			} & DefaultResponse
		>({
			method: 'get',
			URL: `/api/classroom/get_grade_config`,
			token: this.authStore.getToken,
			spinnerStatus: true,
		})
		return dataFetch.body.gradeConfig ?? { min: '', max: '' }
	}

	async getGradePrograms(idModule: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				programs?: Array<GradeProgram>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/grades/get_grade_programs/${idModule}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body.programs ?? []
	}

	async getStudentsGrades(idModule: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				students?: Array<StudentGrade>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/grades/get_students_grades/${idModule}`,
			token: this.authStore.getToken,
			spinnerStatus: true,
		})
		return dataFetch.body.students ?? []
	}

	async getStudentGrades(idModule: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				grades: Array<GradeSee>
			}> &
				DefaultResponse
		>({
			URL: `/api/c/classroom/grades/get_student_grades/${idModule}`,
			token: this.authStore.getToken,
			method: 'get',
			spinnerStatus: true,
		})
		return dataFetch.body?.grades ?? []
	}

	async downloadGrades() {
		const dataFetch = await this.fetch.fetchData<
			BlobPart & DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/grades/download_grades`,
			spinnerStatus: true,
			token: this.authStore.getToken,
			headers: {
				'content-type': 'application/json',
			},
			responseType: 'blob',
		})
		return this.filesService.blobPartToUrl(dataFetch, 'application/pdf')
	}

	async downloadGradesSemester(idSemester: string) {
		const dataFetch = await this.fetch.fetchData<
			BlobPart & DefaultResponse
		>({
			method: 'get',
			URL: `/api/classroom/grades/download_grades?semester=${idSemester}`,
			spinnerStatus: true,
			headers: {
				'content-type': 'application/json',
			},
			responseType: 'blob',
		})
		return this.filesService.blobPartToUrl(dataFetch, 'application/pdf')
	}

	async exportGrades(idModule: string) {
		const dataFetch = await this.fetch.fetchData<
			BlobPart & DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/grades/export_grades/${idModule}`,
			token: this.authStore.getToken,
			spinnerStatus: true,
			headers: {
				'content-type': 'application/json',
			},
			responseType: 'blob',
		})
		return this.filesService.blobPartToUrl(
			dataFetch,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		)
	}

	async updateGrades(gradeConfig: { max: string; min: string }) {
		try {
			if (gradeConfig.max === '' || gradeConfig.min === '')
				throw new Error('Los campos no pueden estar vacíos')
			if (
				!Number.isInteger(Number(gradeConfig.max)) ||
				!Number.isInteger(Number(gradeConfig.min))
			)
				throw new Error('Las calificaciones deben ser enteros')

			await this.fetch.fetchData({
				method: 'post',
				URL: `/api/classroom/update_grades_config`,
				body: gradeConfig,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message:
					'Se ha actualizado la configuración de calificaciones exitosamente',
				type: 'success',
			})
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	private validateNumber(number: string, index?: number) {
		if (number === '')
			throw new Error(
				`Indique un porcentaje para la calificación ${
					index ? 'acumulativa ' + index + '°' : ''
				}`,
			)
		if (parseInt(number) <= 0 || Number.isInteger(number))
			throw new Error(
				`El porcentaje ${
					index ? 'de la calificación acumulativa ' + index + '°' : ''
				} debe ser entero y mayor a cero`,
			)
	}

	private validatorsProgram(program: {
		number: string
		percentage: string
		is_acumulative: string
		acumulative: Array<{
			percentage: string
			number?: number
		}>
	}) {
		if (program.number === '')
			throw new Error('Seleccione un número de calificación')
		this.validateNumber(program.percentage)
		if (program.is_acumulative === 'true') {
			if (program.acumulative.length < 2)
				throw new Error(
					'Deben existir mín. 2 calificaciones acumulativas',
				)
			program.acumulative.forEach((acumulative, i) => {
				this.validateNumber(acumulative.percentage, i + 1)
			})
		}
	}

	async uploadProgram(
		idModule: string,
		program: {
			number: string
			percentage: string
			is_acumulative: string
			acumulative: Array<{
				percentage: string
				number?: number
			}>
		},
	) {
		try {
			this.validatorsProgram(program)
			const body = {
				number: parseInt(program.number),
				percentage: parseInt(program.percentage),
				is_acumulative: program.is_acumulative === 'true',
				acumulative: program.acumulative.map((ac, i) => {
					return {
						percentage: parseInt(ac.percentage),
						number: i + 1,
					}
				}),
			}
			const dataFetch = await this.fetch.fetchData<
				BodyFetch<{
					_id: string
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: `/api/c/classroom/grades/upload_program/${idModule}`,
				body,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha subido exitosamente la programación',
				type: 'success',
			})
			return {
				...body,
				_id: dataFetch.body._id,
			}
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async deleteProgram(idProgram: string, idModule: string) {
		try {
			await this.fetch.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/grades/delete_program/${idModule}/${idProgram}`,
				token: this.authStore.getToken,
				spinnerStatus: true,
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

	// Grade
	async addGrade(
		data: {
			grade?: number
			program: string
			acumulative?: string
		},
		idModule: string,
		idStudent: string,
	) {
		try {
			// Fetch data
			const dataFetch = await this.fetch.fetchData<
				BodyFetch<{
					_id: string
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: `/api/c/classroom/grades/upload_grade/${idModule}/${idStudent}`,
				body: data,
				spinnerStatus: true,
				token: this.authStore.getToken,
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

	async updateGrade(idModule: string, idGrade: string, grade: number) {
		try {
			await this.fetch.fetchData({
				method: 'put',
				URL: `/api/c/classroom/grades/update_grade/${idModule}/${idGrade}`,
				body: {
					grade,
				},
				spinnerStatus: true,
				token: this.authStore.getToken,
			})

			return true
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}
}
