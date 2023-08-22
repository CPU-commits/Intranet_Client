import { DefaultResponse, Fetch } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { Observation } from '~~/models/booklife/observation.model'
import { UserTypesKeys } from '~~/models/user/user.model'

export class BooklifeService {
	private readonly authStore = useAuthStore()
	private readonly toastStore = useToastsStore()
	private readonly fetch: Fetch

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	async getSemesterObservations(idSemester: string, idStudent?: string) {
		let URL: string
		if (
			this.authStore.userTypeIs(
				UserTypesKeys.STUDENT,
				UserTypesKeys.STUDENT_DIRECTIVE,
			)
		) {
			URL = `/api/booklife/get_booklife?semester=${idSemester}`
		} else {
			URL = `/api/booklife/get_booklife_student/${idStudent}?semester=${idSemester}`
		}
		// Get data
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				observations?: Array<Observation>
			}> &
				DefaultResponse
		>({
			URL,
			token: this.authStore.getToken,
			method: 'get',
			spinnerStatus: true,
		})
		return dataFetch.body.observations ?? []
	}

	private validateObservation(form: { observation: string; type: string }) {
		if (form.observation.length > 500 || form.observation === '')
			throw new Error('Debe existir una observación de máx. 500 cárac.')
		if (form.type === '')
			throw new Error('Debe seleccionar un tipo de observación')
	}

	async uploadObservation(
		observation: { observation: string; type: string },
		idStudent: string,
		idSemester: string,
	) {
		try {
			this.validateObservation(observation)
			const data = {
				observation: observation.observation,
				type: observation.type === 'true',
			}
			const dataFetch = await this.fetch.fetchData<
				BodyFetch<{
					observation: Observation
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: `/api/booklife/upload_observation/${idStudent}/${idSemester}`,
				body: data,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})

			return dataFetch.body.observation
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async updateObservation(observation: string, id: string) {
		try {
			if (observation === '')
				throw new Error('La observación no puede estar vacía')
			await this.fetch.fetchData({
				method: 'put',
				URL: `/api/booklife/update_observation/${id}`,
				body: { observation },
				token: this.authStore.getToken,
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

	async deleteObservation(id: string) {
		try {
			await this.fetch.fetchData({
				URL: `/api/booklife/delete_observation/${id}`,
				token: this.authStore.getToken,
				spinnerStatus: true,
				method: 'delete',
			})
			this.toastStore.addToast({
				message: 'Se ha eliminado la observación exitosamente',
				type: 'success',
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
}
