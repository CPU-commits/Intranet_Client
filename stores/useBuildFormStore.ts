import { defineStore } from 'pinia'
// Types
import type { Editor } from '@tiptap/core'
import type { ItemQuestionType, ItemType } from '~~/models/form/item.model'
import type { UserForm } from '~~/models/form/form.model'

export type GlobalForm = Omit<
	Omit<Omit<Omit<UserForm, 'items'>, 'author'>, 'upload_date'>,
	'update_date'
> & {
	items: Array<
		Omit<ItemType, 'questions'> & {
			questions: Array<Omit<ItemQuestionType, 'answer'>>
		}
	>
}

const useBuildFormStore = defineStore('build_form', {
	state() {
		return {
			form: {
				title: 'Nuevo formulario',
				has_points: '',
				items: [],
				_id: '',
			} as GlobalForm,
			checked: 0,
			question: 0,
			editor: null as Editor | null,
		}
	},
	getters: {
		getItems(state) {
			return state.form.items
		},
		getType(state) {
			return state.form.has_points
		},
		getQuestion(state) {
			return state.question
		},
		getChecked(state) {
			return state.checked
		},
		getCheckedItem(state) {
			return state.form.items[state.checked]
		},
		getEditor(state) {
			return state.editor
		},
	},
	actions: {
		setEditor(editor: Editor) {
			this.editor = editor
		},
		newItem() {
			const toasts = useToastsStore()
			if (this.form.items.length !== 10) {
				this.form.items.push({
					title: '',
					points_type: '',
					questions: [
						{
							question: '',
							type: '',
							answers: [],
							correct: 0,
							points: '0',
						},
					],
				})
			} else {
				toasts.addToast({
					message: 'Máx. 10 items',
					type: 'error',
				})
			}
		},
		deleteItem(index: number) {
			this.question = 0
			this.checked = 0
			this.editor?.commands.setContent(
				this.form.items[this.checked].questions[this.question].question,
			)
			this.form.items.splice(index, 1)
		},
		changeItem(
			item: Omit<ItemType, 'questions'> & {
				questions: Array<Omit<ItemQuestionType, 'answer'>>
			},
		) {
			this.question = 0
			if (this.editor)
				this.editor.commands.setContent(item.questions[0].question)
		},
		setInitQuestion() {
			if (
				this.editor &&
				this.getCheckedItem.questions[this.question]?.question
			)
				this.editor.commands.setContent(
					this.getCheckedItem.questions[this.question].question,
				)
		},
		newQuestion() {
			const toasts = useToastsStore()
			if (this.getCheckedItem.questions.length !== 100) {
				this.getCheckedItem.questions.push({
					question: '',
					type: '',
					answers: [],
					correct: 0,
					points: '0',
				})
			} else {
				toasts.addToast({
					message: 'Máx. 100 preguntas',
					type: 'error',
				})
			}
		},
		newAnswer() {
			this.getCheckedItem.questions[this.getQuestion].answers.push('')
		},
		deleteQuestion() {
			const length = this.getCheckedItem.questions.length
			if (length > 1 && this.editor) {
				// Splice
				this.getCheckedItem.questions.splice(this.getQuestion, 1)
				// Minus --
				if (length === this.getQuestion + 1) this.question--
				// Set content
				this.editor.commands.setContent(
					this.getCheckedItem.questions[this.getQuestion].question,
				)
			} else {
				const toasts = useToastsStore()
				toasts.addToast({
					message: 'Debe existir mín. 1 pregunta',
					type: 'error',
				})
			}
		},
		deleteAnswer(index: number) {
			this.getCheckedItem.questions[this.getQuestion].answers.splice(
				index,
				1,
			)
		},
		changeQuestion(index: number) {
			if (!this.editor) return
			// Set value question
			this.getCheckedItem.questions[this.getQuestion].question =
				this.editor.getHTML()
			// Set question
			this.question = index
			// Set content
			this.editor.commands.setContent(
				this.getCheckedItem.questions[this.getQuestion].question,
			)
		},
		async initForm(idForm: string) {
			const { $formService } = useNuxtApp()
			const dataFetch = await $formService.getFormUser(idForm)
			const form = dataFetch

			form.items = form.items.map((item) => {
				const { questions, ...rest } = item
				return {
					...rest,
					questions: questions.map((questionUn) => {
						const { answers, question, ...rest } = questionUn
						return {
							...rest,
							question,
							answers: answers ?? [],
						}
					}),
					points: questions
						.reduce((a, b) => {
							if (b.points) return a + Number(b.points)
							return a
						}, 0)
						.toString(),
				}
			})
			// Init values
			this.form = form
			this.form.has_points = String(form.has_points)
		},
		async updateForm(idForm: string) {
			const { $formService } = useNuxtApp()
			return await $formService.updateForm(this.form, idForm)
		},
		async uploadForm() {
			const { $formService } = useNuxtApp()
			const router = useRouter()

			const uploaded = await $formService.uploadForm(this.form)
			if (uploaded) router.push('/aula_virtual/formularios')
		},
		async deleteForm(idForm: string) {
			const { $formService } = useNuxtApp()
			return await $formService.deleteForm(idForm)
		},
	},
})

export default useBuildFormStore
