import { BodyFetch } from '~/models/body.model'
import { DegreeOrCertificate } from '~/models/user/teacher.model'

export class DegreesOrCertificateService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()

	async getDegreesTypes() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{ types: Array<{ text: string; value: string }> }>
		>({
			method: 'get',
			URL: '/api/degrees/types',
			token: this.authStore.getToken,
		})

		return dataFetch.body.types
	}

	async uploadDegree(
		degreeOrCertificate: DegreeOrCertificate,
		idTeacher: string,
	) {
		try {
			const newDegree = validators<DegreeOrCertificate>(
				{
					title_or_subject: {
						type: 'string',
						custom_name: 'Titulo',
						min: 1,
					},
					type: {
						type: 'string',
						custom_name: 'Nivel educación',
						min: 1,
					},
					award_date: {
						type: 'string',
						custom_name: 'Fecha de obtención',
						min: 1,
					},
					institution: {
						type: 'string',
						custom_name: 'Institución',
						min: 1,
					},
					accreditation: {
						type: 'string',
						custom_name: 'Acreditación',
						min: 1,
					},
					verification_method: {
						type: 'string',
						custom_name: 'Método de verificación',
						min: 1,
					},
				},
				degreeOrCertificate,
			).transform()

			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/degrees/${idTeacher}`,
				token: this.authStore.getToken,
				body: newDegree,
			})
			this.toastsStore.addToast({
				type: 'success',
				message: 'Se ha actualizado el perfil profesional exitosamente',
			})
			return true
		} catch (err) {
			const error = this.nuxtApp.$fetchModule.handleError(err)
			this.toastsStore.addToast({
				type: 'error',
				message: error.message,
			})
			return false
		}
	}
}
