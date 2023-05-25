import { DefaultResponse } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { Teacher, Teachers } from '~~/models/user/teacher.model'
import { User } from '~~/models/user/user.model'
import validator from '~~/utils/validator'

export class TeacherService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()
	private readonly LIMIT = 30

	async getTeachers(total = false, skip?: number, search?: string) {
		let URL = `/api/teachers/get_teachers?total=${total}&limit=${this.LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip && skip >= 0) URL += `&skip=${skip}`
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<Teachers> & DefaultResponse
		>({
			URL,
			method: 'get',
			spinnerStatus: true,
			token: this.authStore.getToken,
			abort: {
				url: 'same',
			},
		})
		return dataFetch.body
	}

	private validatorsTeacher(
		formTeacher: Omit<Omit<User, '_id'>, 'user_type'>,
	) {
		if (formTeacher.name === '' || formTeacher.name.length > 100)
			throw new Error('Debe existir un nombre de máx. 100 carac.')
		if (
			formTeacher.first_lastname === '' ||
			formTeacher.first_lastname.length > 100
		)
			throw new Error(
				'Debe existir un apellido paterno de máx. 100 carac.',
			)
		if (
			formTeacher.second_lastname === '' ||
			formTeacher.second_lastname.length > 100
		)
			throw new Error(
				'Debe existir un apellido materno de máx. 100 carac.',
			)
		if (
			formTeacher.rut.length < 10 ||
			!validator.rutValidator(formTeacher.rut)
		)
			throw new Error(
				'Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)',
			)
	}

	async uploadTeacher(teacher: Omit<Omit<User, '_id'>, 'user_type'>) {
		try {
			this.validatorsTeacher(teacher)
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					teacher: Teacher
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/teachers/new_teacher',
				body: teacher,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha agregado el profesor exitosamente',
				type: 'success',
			})
			return dataFetch.body.teacher
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async uploadTeachers(
		teachers: Array<Omit<Omit<User, '_id'>, 'user_type'>>,
	) {
		try {
			for (const teacher of teachers) this.validatorsTeacher(teacher)
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: '/api/teachers/new_teachers',
				body: teachers,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se han agregado los profesores exitosamente',
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

	async editTeacher(teacher: Teacher) {
		try {
			this.validatorsTeacher(teacher.user)
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'put',
				URL: `/api/teachers/edit_teacher/${teacher.user._id}`,
				body: teacher.user,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha editado con éxito el profesor',
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

	async addSubjectCourse(subject: string, idTeacher: string) {
		try {
			if (subject === '')
				throw new Error('Debe seleccionar una materia - curso')
			const subjectCourse = subject.split('-')
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<Teacher> & DefaultResponse
			>({
				method: 'post',
				URL: `/api/teachers/add_subject_course/${idTeacher}`,
				body: {
					course: subjectCourse[0],
					subject: subjectCourse[1],
				},
				token: this.authStore.getToken,
				spinnerStatus: true,
			})
			this.toastsStore.addToast({
				message: 'Se ha agregado exitosamente la materia/curso',
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

	async deleteSubjectCourse(idImparted: string, idTeacher: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/teachers/delete_subject_course/${idTeacher}/${idImparted}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})

			this.toastsStore.addToast({
				message:
					'Se ha eliminado la materia - curso al profesor exitosamente',
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

	async changeStatus(why: string, idTeacher: string) {
		try {
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/directive/change_status/${idTeacher}`,
				body: { why },
				token: this.authStore.getToken,
				spinnerStatus: true,
			})
			this.toastsStore.addToast({
				message: 'Se ha cambiado el estado del profesor exitosamente',
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
