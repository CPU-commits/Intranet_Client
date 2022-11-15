import type { DefaultResponse } from '~~/common/fetchModule'
import type { BodyFetch } from '~~/models/body.model'
import type { Course, Section } from '~~/models/course/course.model'
import type { Cycle } from '~~/models/course/cycle.model'
import { Student } from '~~/models/user/student.model'

type CourseForm = {
	course: string
	cycle: string
	level: number
}

export class CourseService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()

	async getCourse(idCourse: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				course: Course
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/course/get_course/${idCourse}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.course
	}

	async getCourses() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				courses: Array<Course>
			}> &
				DefaultResponse
		>({
			method: 'get',
			token: this.authStore.getToken,
			URL: '/api/course/get_courses',
			spinnerStatus: true,
		})
		return dataFetch.body.courses
	}

	async getCycles() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				cycles: Array<Cycle>
			}> &
				DefaultResponse
		>({
			method: 'get',
			token: this.authStore.getToken,
			URL: '/api/course/get_cycles',
			spinnerStatus: true,
		})
		return dataFetch.body.cycles
	}

	async getSections() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				sections: Array<Section>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/course/get_sections',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.sections
	}

	async getVariableSections() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				sections: Array<Section>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/course/get_variable_sections',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.sections
	}

	async getSectionsNextLevel(idCourse: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				course: Course
				sections: Array<Section>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/course/get_sections_next_level/${idCourse}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body
	}

	async getSectionsCourse(idCourse: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				sections: Array<Section>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/course/get_sections_course/${idCourse}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.sections
	}

	async getStudentsFromCourse(idCourse: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<Array<Student>> & DefaultResponse
		>({
			method: 'get',
			URL: `/api/students/get_students_course/${idCourse}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body
	}

	// Cycles
	async newCycle(cycle: string) {
		try {
			if (cycle === '' || cycle.length > 100)
				throw new Error('Debe existir un ciclo con máx. 100 cárac.')
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					cycle: Cycle
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/course/new_cycle',
				body: { cycle },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha agregado exitosamente el ciclo',
				type: 'success',
			})
			return dataFetch.body.cycle
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async deleteCycle(cycle: string, idCycle: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/course/delete_cycle/${idCycle}`,
				body: { cycle },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha eliminado exitosamente el ciclo',
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

	// Courses
	private validateCourse(course: CourseForm | Course) {
		if (course.course === '' || course.course.length > 100)
			throw new Error('Debe existir un curso con máx 100 cárac.')
		if (course.cycle === '') throw new Error('Debe seleccionar un ciclo')
		if (course.level <= 0)
			throw new Error('Debe existir un nivel/grado mayor a 0')
	}

	async newCourse(course: CourseForm) {
		try {
			this.validateCourse(course)
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					course: Course
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/course/new_course',
				body: course,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha agregado el curso exitosamente',
				type: 'success',
			})
			return dataFetch.body.course
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async updateCourse(course: Course, idCourse: string) {
		try {
			this.validateCourse(course)
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					course: Course
				}> &
					DefaultResponse
			>({
				method: 'put',
				URL: `/api/course/update_course/${idCourse}`,
				body: {
					...course,
					cycle: course.cycle._id,
					isFinal: course.isFinal === 'true',
				},
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha actualizado el curso exitosamente',
				type: 'success',
			})
			return dataFetch.body.course
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async deleteCourse(idCourse: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/course/delete_course/${idCourse}`,
				token: this.authStore.getToken,
				spinnerStatus: true,
			})
			this.toastsStore.addToast({
				message: 'Se ha eliminado la sección exitosamente',
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

	// Sections
	async newSection(
		section: string,
		files: FileList | null,
		idCourse: string,
	) {
		try {
			if (section === '' || section.length > 100)
				throw new Error('Debe existir una sección con máx. 100 cárac.')
			if (!files || files?.length === 0)
				throw new Error('Debes subir una imágen')
			// Form
			const form = new FormData()
			form.append('section', section)
			form.append('image', files[0])
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					section: Section
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: `/api/course/new_section/${idCourse}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
				body: form,
			})
			// New values
			this.toastsStore.addToast({
				message: 'Se ha agregado la sección exitosamente',
				type: 'success',
			})
			return dataFetch.body.section
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async addTeacher(idTeacher: string, idSection: string) {
		try {
			let url = '/api/course'
			if (idTeacher !== '') {
				url += `/add_teacher_section/${idTeacher}/${idSection}`
			} else {
				url += `/remove_teacher_section/${idSection}`
			}
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: url,
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

	async deleteSection(id: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/course/delete_section/${id}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha eliminado la sección exitosamente',
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

	async changeFile(sectionId: string, files: FileList | null) {
		try {
			if (!files || !files[0]?.type?.includes('image'))
				throw new Error('Debe seleccionar una imágen')
			const form = new FormData()
			form.append('image', files[0])
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<string> & DefaultResponse
			>({
				method: 'put',
				URL: `/api/course/change_image/${sectionId}`,
				spinnerStatus: true,
				body: form,
				token: this.authStore.getToken,
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

	async selectNextSection(idSection: string, idNextSection?: string) {
		try {
			let URL = `/api/course/select_next_section/${idSection}`
			if (idNextSection) URL += `?idNextSection=${idNextSection}`
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'put',
				URL,
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
