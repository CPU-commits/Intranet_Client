// Types
import type { DefaultResponse, Fetch } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import type { ClassroomModule } from '~~/models/classroom/modules.model'
import type {
	FinishSemester,
	Semester,
} from '~~/models/semester/semester.model'
import type { Student } from '~~/models/user/student.model'

export class SemestersService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly fetch: Fetch

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	async getSemesters() {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				semesters: Array<Semester>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/semesters/get_semesters',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.semesters
	}

	async getSemester(idSemester: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				semester: Semester
			}>
		>({
			method: 'get',
			URL: `/api/semesters/${idSemester}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body.semester
	}

	async getYears() {
		const dataFetch = await this.fetch.fetchData<
			{ body: { years: Array<{ year: number }> } } & DefaultResponse
		>({
			method: 'get',
			URL: '/api/semesters/get_years',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.years
	}

	async getParticipatedSemesters() {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				semesters: Array<Semester>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/semesters/get_participated_semesters',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.semesters
	}

	async getCurrentSemester() {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				semester: Semester
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/semesters/get_current_semester',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.semester
	}

	async getFinishSemester() {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				finish_semester: FinishSemester
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/semesters/get_finish_semester',
			token: this.authStore.getToken,
			spinnerStatus: true,
		})
		return dataFetch.body.finish_semester
	}

	async getModulesSemester(idSemester: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				modules: Array<ClassroomModule>
			}>
		>({
			method: 'get',
			token: this.authStore.getToken,
			URL: `/api/classroom/get_populated_modules_semester/${idSemester}`,
		})

		return dataFetch.body.modules
	}

	async getSemesterYear(year: number) {
		const dataFetch = await this.fetch.fetchData<
			{ body: { semesters: Array<Semester> } } & DefaultResponse
		>({
			method: 'get',
			URL: `/api/semesters/get_semester_year/${year}`,
			token: this.authStore.getToken,
		})
		const finishedSemesters = dataFetch.body.semesters.filter(
			(semester) => semester.status === 0,
		)

		const promises = {
			first: {
				promises: [] as Array<
					Promise<
						{
							body: {
								modules: Array<ClassroomModule>
							}
						} & DefaultResponse
					>
				>,
				semester: null as Semester | null,
			},
			second: {
				promises: [] as unknown as [
					Promise<
						{
							body: {
								modules: Array<ClassroomModule>
							}
						} & DefaultResponse
					>,
					Promise<
						{
							body: {
								students: Array<Student>
							}
						} & DefaultResponse
					>,
				],
				semester: null as Semester | null,
			},
		}
		finishedSemesters.forEach((semester) => {
			if (semester.semester === 1) {
				promises.first.promises.push(
					this.fetch.fetchData({
						method: 'get',
						token: this.authStore.getToken,
						URL: `/api/classroom/get_populated_modules_semester/${semester._id}`,
					}),
				)
				promises.first.semester = semester
			} else {
				promises.second.promises.push(
					this.fetch.fetchData<
						{
							body: {
								modules: Array<ClassroomModule>
							}
						} & DefaultResponse
					>({
						method: 'get',
						token: this.authStore.getToken,
						URL: `/api/classroom/get_populated_modules_semester/${semester._id}`,
					}),
					this.fetch.fetchData<
						{
							body: {
								students: Array<Student>
							}
						} & DefaultResponse
					>({
						method: 'get',
						token: this.authStore.getToken,
						URL: `/api/semesters/get_repeating_students/${semester._id}`,
					}),
				)
				promises.second.semester = semester
			}
		})
		const dataFetchSemesters = await Promise.all([
			Promise.all(promises.first.promises),
			Promise.all(promises.second.promises),
		]).then((data) => {
			return {
				first:
					data[0].length > 0
						? {
								modules: data[0][0].body.modules,
								semester: promises.first.semester,
						  }
						: {
								semester: promises.first.semester,
						  },
				second:
					data[1].length > 0
						? {
								modules: data[1][0].body.modules,
								students: data[1][1].body.students,
								semester: promises.second.semester,
						  }
						: {
								semester: promises.second.semester,
						  },
			}
		})

		const semesters = [
			dataFetchSemesters.first,
			dataFetchSemesters.second,
		].filter((semester) => semester?.semester)
		return {
			semesters: semesters as Array<{
				modules?: Array<ClassroomModule>
				semester: Semester
				students?: {
					students?: Array<Student>
				}
			}>,
		}
	}

	private validatorsSemester(semester: { year: string; semester: string }) {
		if (parseInt(semester.year.toString()) < 0)
			throw new Error('Debe indicar un año')
		if (semester.semester === '')
			throw new Error('Debe seleccionar un semestre')
	}

	async addSemester(semester: { year: string; semester: string }) {
		try {
			this.validatorsSemester(semester)
			const dataFetch = await this.fetch.fetchData<
				BodyFetch<{
					semester: Semester
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/semesters/add_semester',
				body: semester,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha agregado exitosamente el semestre',
				type: 'success',
			})

			return dataFetch.body.semester
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async initSemester(idSemester: string) {
		try {
			await this.fetch.fetchData({
				method: 'post',
				URL: `/api/semesters/init_semester/${idSemester}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: `Se ha inicializado el semestre y se han agregado los módulos de aula virtual`,
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

	async updateSemester(semester: Semester) {
		try {
			this.validatorsSemester({
				year: semester.year.toString(),
				semester: semester.semester.toString(),
			})

			const dataFetch = await this.fetch.fetchData<
				BodyFetch<{
					semester: Semester
				}> &
					DefaultResponse
			>({
				method: 'put',
				URL: `/api/semesters/update_semester/${semester._id}`,
				body: semester,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha actualizado con exito el semestre',
				type: 'success',
			})

			return dataFetch.body.semester
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async interruptFinishSemester() {
		try {
			await this.fetch.fetchData({
				method: 'put',
				URL: '/api/semesters/interrupt_finish_Semester',
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message:
					'Se ha interrumpido exitosamente la finalización del semestre',
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

	async finishCurrentSemester(data: {
		students_repeat: Array<string>
		students_next_courses: Array<{
			student: string
			id_next_section: string
		}>
	}) {
		try {
			// Fecth
			await this.fetch.fetchData({
				method: 'put',
				URL: '/api/semesters/finish_semester',
				spinnerStatus: true,
				body: data,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha finalizado el semestre exitosamente',
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
}
