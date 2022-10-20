<script setup lang="ts">
// Types
import type { AnswerWEvaluate } from '~~/models/classroom/answer.model';
import type { ItemQuestion } from '~~/models/form/form.model'
import type { User } from '~~/models/user/user.model'
// Utils
import { formatDate, intToChar } from '~~/utils/format'

// Props
const { question, number, idWork } = defineProps<{
    question: ItemQuestion
    number: number
    idWork: string
}>()
// Stores
const form = useFormStore()

// Init variables
const status = ref(0) // Init
const answer = ref<AnswerWEvaluate | null>(null)
const evaluator = ref<User | null>(null)
// Time
let timeout: NodeJS.Timeout | null

// Resolve answer
try {
    answer.value = form.getAnswers[number - 1]
} catch(err) {
    answer.value = null
}

// Answer
if (answer.value) {
    status.value = 2
    if (question.type === 'written') {
        if (form.getWorkStatus === 'revised')
            evaluator.value = answer.value.evaluate.evaluator as User
        form.setQuestionAnswer(
            question?._id ?? '',
            answer.value.answer.response,
        )
    } else {
        form.setQuestionAnswer(
            question?._id ?? '',
            answer.value.answer.answer.toString(),
        )
    }
} else {
    form.setQuestionAnswer(
        question?._id ?? '',
        '',
    )
}

function deleteQuestion() {
    form.setQuestionAnswer(
        question?._id ?? '',
        '',
    )
    saveQuestion()
}

async function saveQuestion() {
    status.value = 1
    const saved = await form.saveQuestion(
        question,
        idWork,
    )
    if (saved) {
        if (question.answer !== '') {
            status.value = 2
        } else {
            status.value = 0
        }
    } else {
        status.value = 3
    }
}

function keyDown() {
    status.value = 1
    if (timeout) {
        clearTimeout(timeout)
        timeout = null
    }
    timeout = setTimeout(saveQuestion, 1000)
}
</script>

<template>
    <article class="Question" id="pregunta{number}">
        <header class="Question__header">
            <h4>
                {{ number }})
                <template v-if="form.getWorkStatus === 'opened'">
                    <i
                        v-if="status === 1"
                        class="fa-solid fa-spinner"
                        title="Guardando..."
                    />
                    <i
                        v-else-if="status === 2"
                        class="fa-solid fa-circle-check"
                        title="Guardada"
                    />
                    <i 
                        v-else-if="status === 3"
                        class="fa-solid fa-circle-xmark Error"
                        title="Fallo al guardar"
                    />
                </template>
            </h4>
            <HTMLRich :readOnly="true" :haveBackground="false" :body="question.question" />
        </header>
        <template v-if="!question.type.includes('alternatives')">
            <HTMLTextArea
                v-if="form.getWorkStatus === 'opened'"
                :keydown="keyDown"
                placeholder="Respuesta..."
                v-model:value="question.answer"
            />
            <template v-else>
                <pre>R\: {{ question.answer }}</pre>
                <template v-if="form.getWorkStatus === 'revised' && answer">
                    <span>
                        Puntaje obtenido:
                        <span class="Correct">
                            {{ answer.evaluate.points }} pts.
                        </span>
                    </span>
                    <small>
                        Evaluador:
                        <span class="Correct" v-if="evaluator">
                            {{ evaluator.name }}
                            {{ evaluator.first_lastname }}
                        </span>
                        {{ formatDate(answer.evaluate.date) }}
                    </small>
                    <div v-if="question.answers">
                        <h4>Posibles respuestas</h4>
                        <p v-for="(answers, i) in question.answers" :key="i">
                            - {{ answers }}
                        </p>
                    </div>
                </template>
            </template>
        </template>
        <div v-else v-for="(answer, i) in question.answers" class="Answer">
            <span>{{ intToChar(i) }})</span>
            <input
                v-model="question.answer"
                @change="saveQuestion"
                :value="i.toString()"
                type="radio"
                :disabled="form.getWorkStatus !== 'opened'"
            />
            <p>{{ answer }}</p>
            <span v-if="form.getWorkStatus === 'revised' && i === question.correct" class="Correct">
                Correcta
            </span>
        </div>
        <small v-if="question.type === 'alternatives'">
            Pregunta sin puntaje
        </small>
        <small v-if="question.points">
            Puntaje: {{ question.points }} pts.
        </small>
        <div v-if="question.type !== 'written' && form.getWorkStatus === 'opened'">
            <HTMLButtonIcon
                title="Eliminar respuesta"
                :click="deleteQuestion"
                classItem="fa-solid fa-delete-left"
                :oneHundred="false"
            />
        </div>
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

	.Question__header h4 i {
		font-size: 0.7rem;
	}

	.Answer {
		display: flex;
		gap: 10px;
	}

	.Error {
		color: var(--color-danger);
	}

	i {
		color: var(--color-main);
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
</style>
