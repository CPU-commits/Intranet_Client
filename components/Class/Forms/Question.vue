<script setup lang="ts">
// Types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Editor } from '@tiptap/core'
import type { ItemQuestionType, ItemType } from '~~/models/form/item.model'
// Utils
import { intToRoman } from '~~/utils/format'

// Props
defineProps<{
	item: Omit<ItemType, 'questions'> & {
		questions: Array<Omit<ItemQuestionType, 'answer'>>
	}
}>()
// Stores
const buildForm = useBuildFormStore()
</script>

<template>
	<section class="Form__questions">
		<h3>
			<i class="fa-solid fa-clipboard-question" />
			Preguntas [Item {{ intToRoman(buildForm.getChecked + 1) }}]
		</h3>
		<aside>
			<HTMLButtonIcon
				title="Eliminar pregunta"
				class-item="fa-solid fa-xmark"
				:click="buildForm.deleteQuestion"
			/>
		</aside>
		<label for="question__type">Tipo de pregunta</label>
		<HTMLSelect
			id="question__type"
			:value="item.questions[buildForm.getQuestion].type"
		>
			<option value="">Seleccionar tipo de pregunta</option>
			<option value="alternatives_correct">
				Alternativas con correcta
			</option>
			<option value="alternatives">
				Alternativas sin correcta (No influye en el puntaje)
			</option>
			<option value="written">Respuesta escrita</option>
		</HTMLSelect>
		<br />
		<HTMLRich
			:fn-focus-down="
				() => {
					// eslint-disable-next-line vue/no-mutating-props
					item.questions[buildForm.getQuestion].question =
						buildForm.getEditor?.getHTML() ?? ''
				}
			"
			:fn-before-mount="buildForm.setInitQuestion"
			placeholder="Pregunta"
			:have-background="false"
			@build-editor="(e: Editor) => buildForm.setEditor(e)"
		/>
		<div
			v-if="
				item.points_type === 'custom' &&
				item.questions[buildForm.getQuestion].type !== 'alternatives'
			"
			class="Form__questions--points"
		>
			<HTMLInput
				id="points"
				:value="item.questions[buildForm.getQuestion].points"
				placeholder="Puntaje pregunta"
				type="number"
			/>
		</div>
		<div class="Form__questions--block">
			<button
				v-for="(_, i) in item.questions"
				:key="i"
				type="button"
				:class="i === buildForm.getQuestion ? 'Selected' : ''"
				class="BlockQuestion"
				@click="() => buildForm.changeQuestion(i)"
			>
				{{ i + 1 }}
			</button>
			<span v-if="item.questions.length === 0"> Sin preguntas </span>
		</div>
		<template
			v-if="
				item.questions[buildForm.getQuestion].type.includes(
					'alternatives',
				)
			"
		>
			<h4>Alternativas</h4>
			<section class="Answers">
				<div
					v-for="(_, i) in item.questions[buildForm.getQuestion]
						.answers"
					:key="i"
					class="Answer"
				>
					<span>{{ i + 1 }})</span>
					<!-- eslint-disable vue/no-mutating-props -->
					<input
						v-if="
							item.questions[buildForm.getQuestion].type ===
							'alternatives_correct'
						"
						v-model="item.questions[buildForm.getQuestion].correct"
						:value="i"
						title="Marcar como correcta"
						type="radio"
					/>
					<HTMLInput
						id="alternative"
						:value="
							item.questions[buildForm.getQuestion].answers[i]
						"
						placeholder="Alternativa"
					/>
					<HTMLButtonIcon
						title="Eliminar alternativa"
						class-item="fa-solid fa-xmark"
						:click="() => buildForm.deleteAnswer(i)"
						:one-hundred="false"
					/>
				</div>
				<HTMLButtonIcon
					title="Nueva alternativa"
					:click="buildForm.newAnswer"
					class-item="fa-solid fa-square-plus"
				/>
			</section>
		</template>
		<template
			v-else-if="item.questions[buildForm.getQuestion].type === 'written'"
		>
			<h4>Posibles respuestas (Opcional)</h4>
			<section class="Answers">
				<div
					v-for="(_, i) in item.questions[buildForm.getQuestion]
						.answers"
					:key="i"
					class="Answer"
				>
					<HTMLInput
						id="answer"
						:value="
							item.questions[buildForm.getQuestion].answers[i]
						"
						placeholder="Respuesta"
					/>
					<HTMLButtonIcon
						title="Eliminar alternativa"
						class-item="fa-solid fa-xmark"
						:click="() => buildForm.deleteAnswer(i)"
						:one-hundred="false"
					/>
				</div>
				<HTMLButtonIcon
					title="Nueva respuesta"
					:click="buildForm.newAnswer"
					class-item="fa-solid fa-square-plus"
				/>
			</section>
		</template>
		<HTMLButtonIcon
			title="Nueva pregunta"
			:click="buildForm.newQuestion"
			class-item="fa-solid fa-circle-plus"
		/>
	</section>
</template>

<style scoped>
.Form__questions {
	padding: 30px;
	border: 2px solid var(--color-light);
	display: flex;
	flex-direction: column;
	position: relative;
}

.Form__questions--block {
	display: flex;
	justify-content: center;
	margin-top: 20px;
	margin-bottom: 20px;
	gap: 4px;
	flex-wrap: wrap;
}

.Form__questions aside {
	position: absolute;
	right: 10px;
	top: 10px;
}

.BlockQuestion {
	padding: 5px;
	width: 20px;
	height: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid var(--color-light);
	background-color: transparent;
	transition: all 0.4s ease;
}

.BlockQuestion:hover {
	color: var(--color-main);
}

.Selected {
	color: var(--color-main);
}

.Answers {
	display: flex;
	flex-direction: column;
	padding: 15px;
	align-items: center;
	border: 1px solid var(--color-light);
	margin-bottom: 20px;
	gap: 10px;
}

.Answer {
	display: flex;
	width: 100%;
	align-items: center;
	gap: 5px;
}

.Form__questions--points {
	max-width: 150px;
}

@media (max-width: 767.98px) {
	.Form__questions {
		padding: 20px;
	}
}

@media (max-width: 575.98px) {
	.Form__questions {
		padding: 15px;
	}

	h3 {
		font-size: 1rem;
		margin-bottom: 10px;
	}
}
</style>
