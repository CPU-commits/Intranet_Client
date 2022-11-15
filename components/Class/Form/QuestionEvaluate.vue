<script setup lang="ts">
// Type
import type { ItemQuestion } from '~~/models/form/form.model'
import { intToChar } from '~~/utils/format'

// Props
const props = defineProps<{
	question: ItemQuestion
	number: number
	idWork: string
	idStudent: string
}>()
// Stores
const form = useFormStore()

// Form
const points = ref('')

// Find answer
const index = form.getAnswers.findIndex((a) => {
	return a.answer.question === props.question._id
})
if (index !== undefined && index !== -1) {
	if (props.question.type === 'written') {
		form.setQuestionAnswer(
			props.question._id ?? '',
			form.getAnswers[index].answer.response,
		)
	} else {
		form.setQuestionAnswer(
			props.question._id ?? '',
			form.getAnswers[index].answer.answer.toString(),
		)
	}
} else {
	form.setQuestionAnswer(props.question._id ?? '', '')
}
// Points
if (props.question.type === 'written' && form.getAnswers[index]?.evaluate)
	points.value = form.getAnswers[index].evaluate.points.toString()
</script>

<template>
	<article :id="`pregunta${number}`" class="Question">
		<header class="Question__header">
			<h4>{{ number }})</h4>
			<HTMLRich
				:body="question.question"
				:read-only="true"
				:have-background="false"
			/>
		</header>
		<template v-if="!question.type.includes('alternatives')">
			<pre>
R\: {{ question.answer !== '' ? question.answer : 'Sin respuesta' }}</pre
			>
			<br />
			<template v-if="form.hasPoints">
				<label for="points">Puntaje final</label>
				<div class="Points">
					<HTMLInput
						id="points"
						v-model:value="points"
						type="number"
					/>
					<HTMLButtonIcon
						title="Subir puntaje"
						:click="
							() =>
								form.uploadPoints(
									points,
									idWork,
									question._id ?? '',
									idStudent,
								)
						"
						class-item="fa-solid fa-arrow-up-from-bracket"
						:one-hundred="false"
					/>
				</div>
			</template>
		</template>
		<div
			v-for="(answer, i) in question.answers"
			v-else
			:key="i"
			class="Answer"
		>
			<span>{{ intToChar(i) }})</span>
			<!-- eslint-disable vue/no-mutating-props -->
			<input
				v-model="question.answer"
				:value="i.toString()"
				type="radio"
				disabled
			/>
			<p>{{ answer }}</p>
			<span
				v-if="
					question.type === 'alternatives_correct' &&
					i === question.correct
				"
				class="Correct"
			>
				Correcta
			</span>
		</div>
		<small v-if="question.type === 'alternatives'">
			Pregunta sin puntaje
		</small>
		<small v-if="question.points">
			Puntaje: {{ question.points }} pts.
		</small>
	</article>
</template>

<style scoped>
.Question {
	margin: 15px;
	padding-bottom: 15px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	border-bottom: 2px solid var(--color-light);
}

.Question__header {
	display: flex;
	width: 100%;
	gap: 5px;
}

.Question__header h4 {
	margin-top: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.Answer {
	display: flex;
	gap: 10px;
}

input[type='radio']:checked:after {
	width: 7px;
	height: 7px;
	border-radius: 15px;
	top: 1px;
	left: 3px;
	position: relative;
	background-color: #0075ff;
	content: '';
	display: inline-block;
}

.Correct {
	color: var(--color-main);
	font-weight: bold;
}

.Points {
	display: flex;
	gap: 20px;
	align-items: center;
}

@media (max-width: 767.98px) {
	.Question {
		margin: 10px;
	}

	.Question h4 {
		font-size: 0.9rem;
		margin-top: 9px;
	}

	span,
	input,
	p {
		font-size: 0.85rem;
	}

	small {
		font-size: 0.78rem;
	}
}

@media (max-width: 575.98px) {
	.Question {
		margin: 8px;
	}

	.Question h4 {
		font-size: 0.8rem;
		margin-top: 4px;
	}

	span,
	input,
	p {
		font-size: 0.75rem;
	}

	small {
		font-size: 0.7rem;
	}
}
</style>
