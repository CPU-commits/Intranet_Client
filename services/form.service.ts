import { DefaultResponse } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { AnswerWEvaluate } from '~~/models/classroom/answer.model'
import { FormType, ItemQuestion, UserForm } from '~~/models/form/form.model'
import { GlobalForm } from '~~/stores/useBuildFormStore'
import { intToRoman } from '~~/utils/format'

export class FormService {
	private readonly authStore = useAuthStore()
	private readonly toastStore = useToastsStore()
	private readonly nuxtApp = useNuxtApp()

	async getForms() {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				forms?: Array<UserForm>
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/c/classroom/forms/get_forms',
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body.forms ?? []
	}

	async getForm(idForm: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				form: UserForm
				answers?: Array<AnswerWEvaluate>
				work: {
					date_limit: Date
					wtime: boolean
					status: string
				}
				points: {
					max_points: number
					total_points: number
				}
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/works/get_form/${idForm}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body
	}

	async getFormUser(idForm: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				form: UserForm
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/forms/get_form/${idForm}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})

		return dataFetch.body.form
	}

	async getFormStudent(idStudent: string, idWork: string) {
		const dataFetch = await this.nuxtApp.$fetchModule.fetchData<
			BodyFetch<{
				answers?: Array<AnswerWEvaluate>
				form: UserForm
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/c/classroom/works/get_form_student/${idWork}/${idStudent}`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body
	}

	private validateForm(form: FormType | GlobalForm) {
		if (form.title.length === 0 || form.title.length > 100)
			throw new Error(
				'El titlo del formulario debe ser de máx. 100 cárac.',
			)
		if (String(form.has_points) === '')
			throw new Error('Debe seleccionar un puntaje (preguntas)')
		if (form.items.length === 0) throw new Error('Debe haber mín. 1 item')
		form.items.forEach((item, i) => {
			if (item.title.length === 0 || item.title.length > 100)
				throw new Error(
					`El titulo del item ${intToRoman(
						i + 1,
					)} debe ser de máx. 100 cárac.`,
				)
			if (
				String(form.has_points) === 'true' &&
				(item.points_type === '' || item.points_type === 'without')
			)
				throw new Error(
					`Debe seleccionar una asignación de puntaje en el item ${intToRoman(
						i + 1,
					)}`,
				)
			if (
				item.points_type === 'equal' &&
				(Number(item.points) <= 0 || !item.points) &&
				String(form.has_points) === 'true'
			)
				throw new Error(
					`Debe indicar un puntaje total a distribuir mayor a 0 en el item ${intToRoman(
						i + 1,
					)}`,
				)
			if (item.questions.length === 0)
				throw new Error(
					`Debe haber mín. 1 pregunta en el item ${intToRoman(
						i + 1,
					)}`,
				)
			item.questions.forEach((question, iQ) => {
				if (question.type === '')
					throw new Error(
						`Debe seleccionar tipo de pregunta en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (!question.question || question.question.length === 0)
					throw new Error(
						`Debe escribir una pregunta en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (
					item.points_type === 'custom' &&
					String(form.has_points) === 'true' &&
					Number(question.points) <= 0 &&
					question.type !== 'alternatives'
				)
					throw new Error(
						`El puntaje debe ser mayor a 0 en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (
					item.points_type === 'custom' &&
					String(form.has_points) === 'true' &&
					!Number.isInteger(Number(question.points)) &&
					question.type !== 'alternatives'
				)
					throw new Error(
						`El puntaje debe ser entero en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				if (
					question.type.includes('alternatives') &&
					question.answers.length <= 1
				)
					throw new Error(
						`Deben existir mín. 2 alternativas en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
				question.answers.forEach((answer, iA) => {
					if (answer.length === 0 || answer.length > 100)
						throw new Error(
							`La respuesta ${
								iA + 1
							} debe ser de máx. 100 cárac. de la pregunta ${
								iQ + 1
							} del item ${intToRoman(i + 1)}`,
						)
				})
				if (
					question.type === 'alternatives_correct' &&
					question?.correct &&
					question.correct >= question.answers.length
				)
					throw new Error(
						`Debe existir una respuesta correcta en la pregunta ${
							iQ + 1
						} del item ${intToRoman(i + 1)}`,
					)
			})
			if (
				item.points_type === 'equal' &&
				String(form.has_points) === 'true'
			) {
				const countQuestions = item.questions.reduce((a, b) => {
					const count = b.type !== 'alternatives' ? 1 : 0
					return a + count
				}, 0)
				const pointsPerQuestion = Number(item.points) / countQuestions
				if (!Number.isInteger(pointsPerQuestion))
					throw new Error(
						`El puntaje equitativo para cada pregunta del item ${intToRoman(
							i + 1,
						)} no es entero. (Resulta ${pointsPerQuestion})`,
					)
			}
		})
	}

	private buildData(form: FormType | GlobalForm) {
		return {
			title: form.title,
			has_points: form.has_points,
			items: form.items.map((item) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const itemData: any = {
					title: item.title,
					questions: item.questions.map((question) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const questionData: any = {
							question: question.question,
							type: question.type,
							answers: question.answers,
						}
						if (questionData.type === 'alternatives_correct')
							questionData.correct = question.correct
						if (
							item.points_type === 'custom' &&
							form.has_points === 'true'
						)
							questionData.points = parseInt(
								question?.points?.toString() ?? '',
							)
						return questionData
					}),
				}
				if (form.has_points === 'true')
					itemData.points_type = item.points_type
				if (item.points_type === 'equal' && form.has_points === 'true')
					itemData.points = parseInt(item?.points?.toString() ?? '')
				return itemData
			}),
		}
	}

	async uploadForm(form: FormType | GlobalForm) {
		try {
			this.validateForm(form)
			const data = this.buildData(form)
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: '/api/c/classroom/forms/upload_form',
				body: data,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha añadido el formulario exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async updateForm(form: GlobalForm, idForm: string) {
		try {
			this.validateForm(form)

			form.items = form.items.map((item) => {
				const { questions, points, ...rest } = item
				return {
					...rest,
					questions: questions.map((questionData) => {
						const { question, points, ...rest } = questionData
						return {
							...rest,
							question,
							points: points
								? parseInt(points.toString())
								: undefined,
						}
					}),
					points: points ? parseInt(points.toString()) : undefined,
				}
			})
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'put',
				URL: `/api/c/classroom/forms/update_form/${idForm}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
				body: form,
			})
			this.toastStore.addToast({
				message: 'Se ha actualizado el formulario exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async grade(idWork: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/c/classroom/works/grade_form/${idWork}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha evaluado el trabajo exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async gradeFiles(idWork: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/c/classroom/works/grade_files/${idWork}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha evaluado el trabajo exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	private buildDataQuestion(question: ItemQuestion) {
		const body: {
			response?: string
			answer?: number
		} = {}
		if (question.type === 'written' && question.answer !== '')
			body.response = question.answer
		if (question.type !== 'written' && question.answer !== '')
			body.answer = parseInt(question.answer)
		return body
	}

	async saveQuestion(question: ItemQuestion, idWork: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				URL: `/api/c/classroom/works/save_answer/${idWork}/${question._id}`,
				method: 'post',
				body: this.buildDataQuestion(question),
				token: this.authStore.getToken,
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async finishForm(formAnswers: Array<any> | undefined, idWork: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/c/classroom/works/finish_form/${idWork}`,
				body: {
					answers: formAnswers,
				},
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Formulario finalizado',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async uploadPoints(
		points: string,
		idWork: string,
		idQuestion: string,
		idStudent: string,
	) {
		try {
			if (points === '')
				throw new Error('Debe indicar un puntaje para la pregunta')
			const pointsNumber = Number(points)
			if (!Number.isInteger(pointsNumber))
				throw new Error('El puntaje debe ser entero')
			if (pointsNumber < 0)
				throw new Error('El puntaje debe ser mayor a cero')
			// Fetch
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'post',
				URL: `/api/c/classroom/works/upload_points_question/${idWork}/${idQuestion}/${idStudent}`,
				body: { points: pointsNumber },
				spinnerStatus: true,
				token: this.authStore.getToken,
			})

			this.toastStore.addToast({
				message:
					'Se ha actualizado el puntaje de la pregunta exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async deleteForm(idForm: string) {
		try {
			await this.nuxtApp.$fetchModule.fetchData({
				method: 'delete',
				URL: `/api/c/classroom/forms/delete_form/${idForm}`,
				spinnerStatus: true,
				token: this.authStore.getToken,
			})
			this.toastStore.addToast({
				message: 'Se ha eliminado el formulario exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.nuxtApp.$fetchModule.handleError(err)
			this.toastStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}
}
