<script setup lang="ts">
// Types
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import { intToRoman } from '~~/utils/format'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(schoolName
	? `Formulario - Aula Virtual - ${schoolName} - Intranet`
	: 'Formulario - Aula Virtual - Intranet')
// Guard
/*definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.TEACHER,
    ],
})*/
// Nuxtapp
const { $fetchModule } = useNuxtApp()
// Stores
const form = useFormStore()
// Router
const route = useRoute()

const idForm = route.params.form
const idStudent = route.params.student
if (typeof idForm !== 'string')
	throw createError({
		message: `[form] must be a string`,
		statusCode: 400,
		fatal: true,
	})
if (typeof idStudent !== 'string')
	throw createError({
		message: `[student] must be a string`,
		statusCode: 400,
		fatal: true,
	})

onBeforeUnmount(() => {
	form.$reset()
})

// Data
try {
    await form.getFormStudent(idForm, idStudent)
} catch (err) {
    const _err = $fetchModule.handleError(err)
    throw createError({
		..._err,
		fatal: true,
	})
}
</script>

<template>
    <ClassForm>
		<Head>
			<Title>{{ title }}</Title>
		</Head>

        <template v-for="(item, i) in form.getItems" :key="i">
            <h3>
                {{ intToRoman(i + 1) }}.
                {{ item.title }}
            </h3>
            <LazyClassFormQuestionEvaluate
                v-for="(question, j) in item.questions"
                :key="j"
                :idWork="idForm"
                :idStudent="idStudent"
                :number="(
                    i - 1 !== -1 ? form.getItems[i - 1].questions.length : 0
                ) + j + 1"
                :question="question"
            />
        </template>
        <template #questions>
            <div class="Questions">
                <div class="Questions__content">
					<NuxtLink
						v-for="(question, i) in form.getItems.flatMap((i) => i.questions)"
						:class="question.answer !== '' ? 'Done' : ''"
						:to="`#pregunta${i}`"
					>
						{{ i + 1 }}
					</NuxtLink>
				</div>
            </div>
        </template>
    </ClassForm>
</template>

<style scoped>
	.Questions__content {
		margin: 10px 0;
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}

	.Done {
		background-color: white;
		color: var(--color-main) !important;
	}

	.Questions__content a {
		border: 1px solid white;
		height: 15px;
		width: 15px;
		display: flex;
		font-size: 0.9rem;
		justify-content: center;
		align-items: center;
		text-decoration: none;
		color: white;
	}

	.Questions {
		position: sticky;
		top: 10px;
		background-color: var(--color-main);
		padding: 5px;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: fit-content;
		border-radius: 5px;
	}

	@media (max-width: 767.98px) {
		h3 {
			font-size: 1.1rem;
		}

		span, button {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 575.98px) {
		h3 {
			font-size: 1rem;
		}

		span, button {
			font-size: 0.8rem;
		}
	}
</style>
