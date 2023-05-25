// Types
import { Parent } from '~/models/user/parent.model'
import type { DefaultResponse } from '~~/common/fetchModule'
import type { BodyFetch } from '~~/models/body.model'
import { User } from '~~/models/user/user.model'
import validator from '~~/utils/validator'

export class ParentService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()
	private readonly LIMIT = 30

	async getParents(total = false, skip?: number, search?: string) {
		let URL = `/api/parents?total=${total}&limit=${this.LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip && skip >= 0) URL += `&skip=${skip}`
		const data = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{ parents: Array<Parent>; total?: number }> &
				DefaultResponse
		>({
			URL,
			token: this.authStore.getToken,
			spinnerStatus: true,
			method: 'get',
			abort: {
				url: 'same',
			},
			scopeSpinner: 'parent_students',
		})
		return data.body
	}

	async getParentStudent() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{ students: Array<User> }> & DefaultResponse
		>({
			URL: `/api/parents/students`,
			method: 'get',
			token: this.authStore.getToken,
			spinnerStatus: true,
			abort: {
				url: 'same',
			},
		})

		return dataFetch.body.students
	}

	async getParentStudentsByID(idParent: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{ students: Array<User> }> & DefaultResponse
		>({
			URL: `/api/parents/${idParent}/students`,
			method: 'get',
			token: this.authStore.getToken,
			spinnerStatus: true,
			abort: {
				url: 'same',
			},
		})

		return dataFetch.body.students
	}

	async changeStatus(why: string, idParent: string) {
		try {
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')

			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/parents/status/${idParent}`,
				body: { why },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})

			this.toastsStore.addToast({
				message: 'Se ha cambiado el estado del apoderado exitosamente',
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

	private validatorsParent(formDirective: User) {
		if (formDirective.name === '' || formDirective.name.length > 100)
			throw new Error('Debe existir un nombre de máx. 100 carac.')
		if (
			formDirective.first_lastname === '' ||
			formDirective.first_lastname.length > 100
		)
			throw new Error(
				'Debe existir un apellido paterno de máx. 100 carac.',
			)
		if (
			formDirective.second_lastname === '' ||
			formDirective.second_lastname.length > 100
		)
			throw new Error(
				'Debe existir un apellido materno de máx. 100 carac.',
			)
		if (
			formDirective.rut.length < 10 ||
			!validator.rutValidator(formDirective.rut)
		)
			throw new Error(
				'Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)',
			)
	}

	async uploadParent(parent: User) {
		try {
			this.validatorsParent(parent)
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{
					parents: Parent
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/parents',
				body: [parent],
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha agregado el apoderado exitosamente',
				type: 'success',
			})

			return dataFetch.body.parents
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async uploadParents(parents: Array<User>) {
		try {
			for (const parent of parents) this.validatorsParent(parent)
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: '/api/parents',
				body: parents,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se han agregado los apoderados exitosamente',
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

	async assignStudent(idParent: string, idStudent: string) {
		try {
			const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
				BodyFetch<{ student: User }> & DefaultResponse
			>({
				method: 'put',
				URL: `/api/parents/${idParent}/students`,
				body: {
					idStudent,
				},
				token: this.authStore.getToken,
				spinnerStatus: true,
			})
			this.toastsStore.addToast({
				message: 'Se ha asignado el alumno exitosamente',
				type: 'success',
			})

			return dataFetch.body.student
		} catch (err) {
			const error = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				message: error.message,
				type: 'error',
			})
			return null
		}
	}

	async editParent(parent: User, idParent: string) {
		try {
			this.validatorsParent(parent)
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'put',
				URL: `/api/parents/${idParent}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
				body: parent,
			})
			this.toastsStore.addToast({
				message: 'Se ha editado con éxito el apoderado',
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
