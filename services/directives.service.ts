// Types
import type { DefaultResponse, Fetch } from '~~/common/fetchModule'
import type { BodyFetch } from '~~/models/body.model'
import type { Directives } from '~~/models/user/directive.model'
import { User } from '~~/models/user/user.model'
import validator from '~~/utils/validator'

export class DirectivesService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly fetch: Fetch
	private readonly LIMIT = 30

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	async getDirectives(total = false, skip?: number, search?: string) {
		let URL = `/api/directive/get_directives?total=${total}&limit=${this.LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip && skip >= 0) URL += `&skip=${skip}`
		const data = await this.fetch.fetchData<
			BodyFetch<Directives> & DefaultResponse
		>({
			URL,
			token: this.authStore.getToken,
			spinnerStatus: true,
			method: 'get',
			abort: {
				url: 'same',
			},
		})
		return data.body
	}

	async changeStatus(why: string, idDirective: string) {
		try {
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')

			await this.fetch.fetchData({
				method: 'post',
				URL: `/api/directive/change_status/${idDirective}`,
				body: { why },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})

			this.toastsStore.addToast({
				message:
					'Se ha cambiado el estado del bibliotecario exitosamente',
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

	private validatorsDirective(formDirective: User) {
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

	async uploadDirective(directive: User) {
		try {
			this.validatorsDirective(directive)
			const dataFetch = await this.fetch.fetchData<
				BodyFetch<{
					directive: User
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/directive/new_directive',
				body: directive,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se ha agregado el directivo exitosamente',
				type: 'success',
			})

			return dataFetch.body.directive
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
		}
	}

	async uploadDirectives(directives: Array<User>) {
		try {
			for (const directive of directives)
				this.validatorsDirective(directive)
			await this.fetch.fetchData({
				method: 'post',
				URL: '/api/directive/new_directives',
				body: directives,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastsStore.addToast({
				message: 'Se han agregado los directivos exitosamente',
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

	async editDirective(directive: User, idDirective: string) {
		try {
			this.validatorsDirective(directive)
			await this.fetch.fetchData({
				method: 'put',
				URL: `/api/directive/edit_directive/${idDirective}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
				body: directive,
			})
			this.toastsStore.addToast({
				message: 'Se ha editado con éxito el directivo',
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
