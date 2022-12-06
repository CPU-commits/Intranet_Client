import { defineStore } from 'pinia'
import { AnswerWEvaluate } from '~~/models/classroom/answer.model'
import { ItemQuestion, UserForm } from '~~/models/form/form.model'

const formStore = defineStore('form', {
	state() {
		return {
			form: null as UserForm | null,
			answers: [] as Array<AnswerWEvaluate>,
			work: undefined as
				| {
						date_limit: Date
						wtime: boolean
						status: string
				  }
				| undefined,
			points: null as {
				max_points: number
				total_points: number
			} | null,
		}
	},
	getters: {
		getWorkStatus(state): string {
			return state.work?.status ?? ''
		},
		isWTime(state) {
			return state.work?.wtime ?? false
		},
		getDateLimit(state) {
			return state.work?.date_limit
		},
		getItems(state) {
			return state.form?.items ?? []
		},
		getAnswers(state) {
			return state.answers
		},
		getPoints(state) {
			return state.points
		},
		hasPoints(state) {
			return state.form?.has_points ?? false
		},
	},
	actions: {
		async getForm(idForm: string) {
			const nuxtApp = useNuxtApp()
			const dataFetch = await nuxtApp.$formService.getForm(idForm)
			// Set data
			this.form = dataFetch.form
			this.answers = dataFetch.answers ?? []
			this.work = dataFetch.work
			this.points = dataFetch.points

			return dataFetch.form.title
		},
		async getFormStudent(idWork: string, idStudent: string) {
			const nuxtApp = useNuxtApp()
			const dataFetch = await nuxtApp.$formService.getFormStudent(
				idStudent,
				idWork,
			)
			// Set data
			this.form = dataFetch.form
			this.answers = dataFetch.answers ?? []

			return dataFetch.form.title
		},
		async finishForm(idWork: string) {
			const { $formService } = useNuxtApp()
			const formAnswers = this.form?.items.flatMap((item) => {
				return item.questions.map((question: ItemQuestion) => {
					const answer: any = {
						question: question._id,
					}
					if (question.type === 'written') {
						answer.response = question.answer
					} else {
						answer.answer = parseInt(question.answer)
					}
					return answer
				})
			})
			return await $formService.finishForm(formAnswers, idWork)
		},
		setQuestionAnswer(idQuestion: string, value: string) {
			this.getItems.forEach((item, i) => {
				const index = item.questions.findIndex(
					(q) => q._id === idQuestion,
				)
				if (index !== -1 && this.form) {
					this.form.items[i].questions[index].answer = value
				}
			})
		},
		async saveQuestion(question: ItemQuestion, idWork: string) {
			const { $formService } = useNuxtApp()
			return await $formService.saveQuestion(question, idWork)
		},
		async uploadPoints(
			points: string,
			idWork: string,
			idQuestion: string,
			idStudent: string,
		) {
			const { $formService } = useNuxtApp()
			await $formService.uploadPoints(
				points,
				idWork,
				idQuestion,
				idStudent,
			)
		},
	},
})

export default formStore
