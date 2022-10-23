<script setup lang="ts">
// Types
import { UserTypesKeys } from '~~/models/user/user.model'
import { intToRoman } from '~~/utils/format';
// Moment
import moment from 'moment'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.STUDENT,
        UserTypesKeys.STUDENT_DIRECTIVE,
    ],
})
// Nuxtapp
const { $fetchModule } = useNuxtApp()
// Stores
const form = useFormStore()
// Router
const router = useRouter()
const route = useRoute()

const idForm = route.params.form
if (typeof idForm !== 'string')
	throw createError({
		message: `[form] must be a string`,
		statusCode: 400,
		fatal: true,
	})

// Init form store
try {
    await form.getForm(idForm)
} catch (err) {
    const _err = $fetchModule.handleError(err)
    throw createError({
		..._err,
		fatal: true,
	})
}

onBeforeUnmount(() => {
	form.$reset()
})

// Modal
const modal = ref(false)
// Time
const seconds = ref('')
// Called
const called = ref(false)

if (form.isWTime && form.getWorkStatus === 'opened')
	sleep()

async function sleep() {
    seconds.value = moment.utc(moment(form.getDateLimit).diff(moment(new Date()))).format('HH:mm:ss')
    while (seconds.value !== '00:00:00') {
        seconds.value = moment
            .utc(moment(form.getDateLimit).diff(moment(new Date())))
            .format('HH:mm:ss')
        await setSeconds()
    }
    finishForm()
}

function setSeconds() {
    return new Promise((resolve) => setTimeout(resolve, 1000))
}

async function finishForm() {
	if (!called.value) {
		const finished = await form.finishForm(idForm as string)
		if (finished) {
			router.push('/aula_virtual')
			called.value = true
		}
	}
}

function sumAfters(index: number): number {
    if (index === 0) return 0
    let counter = 0
    while (index !== 0) {
        counter += form.getItems[index].questions.length
        index -= 1
    }
    return counter
}
</script>

<template>
	<ClassForm>
		<template v-for="(item, i) in form.getItems" :key="i">
			<h3>
				{{ intToRoman(i + 1) }}.
				{{ item.title }}
			</h3>
			<LazyClassFormQuestion
				v-for="(question, j) in item.questions"
				:question="question"
				:idWork="idForm"
				:number="sumAfters(i) + j + 1"
			/>
		</template>
		<template #questions>
			<div slot="questions" class="Questions">
				<span v-if="form.isWTime && form.getWorkStatus === 'opened'">
					{{ seconds }}
				</span>
				<div class="Questions__content">
					<NuxtLink
						v-for="(question, i) in form.getItems.flatMap((i) => i.questions)"
						:class="question.answer !== '' ? 'Done' : ''"
						:to="`#pregunta${i}`"
					>
						{{ i + 1 }}
					</NuxtLink>
				</div>
				<HTMLButtonText
					v-if="form.getWorkStatus === 'opened'"
					color="white"
					:click="() => modal = true"
				>
					<i class="fa-solid fa-flag" /> Finalizar formulario
				</HTMLButtonText>
				<span v-if="form.getWorkStatus === 'revised'">
					{{ form.getPoints?.total_points }} /
					{{ form.getPoints?.max_points }} Pts.
				</span>
			</div>
		</template>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Cerrar formulario</h2>
			</template>
			<span>¿Est&aacute;s seguro de cerrar el formulario?</span>
			<div class="Buttons">
				<HTMLButtonText :click="finishForm">
					S&iacute;, cerrar formulario
				</HTMLButtonText>
				<HTMLButtonText :click="() => modal = false">
					No, no cerrar formulario
				</HTMLButtonText>
			</div>
		</Modal>
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

	.Questions span {
		color: white;
	}

	i {
		color: white;
	}

	span {
		text-align: center;
	}

	.Buttons {
		display: flex;
	}
</style>
