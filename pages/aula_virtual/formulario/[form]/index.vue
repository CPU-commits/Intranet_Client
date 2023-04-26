<!-- eslint-disable import/no-named-as-default-member -->
<script setup lang="ts">
// Dayjs
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
// Types
import { UserTypesKeys } from '~~/models/user/user.model'
import { intToRoman } from '~~/utils/format'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(
	schoolName
		? `Formulario - Aula Virtual - ${schoolName} - Intranet`
		: 'Formulario - Aula Virtual - Intranet',
)
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE],
})
// Nuxtapp
const { $fetchModule } = useNuxtApp()
// Stores
const form = useFormStore()
// Router
const router = useRouter()
const route = useRoute()

dayjs.extend(duration)

const idForm = route.params.form
if (typeof idForm !== 'string')
	throw createError({
		message: `[form] must be a string`,
		statusCode: 400,
		fatal: true,
	})

// Init form store
onMounted(async () => {
	try {
		await form.getForm(idForm)
		if (form.isWTime && form.getWorkStatus === 'opened') sleep()
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		throw createError({
			..._err,
			fatal: true,
		})
	}
})

onUnmounted(() => {
	form.$reset()
})

// Modal
const modal = ref(false)
// Time
const seconds = ref('')
// Called
const called = ref(false)

async function sleep() {
	const getSeconds = () =>
		dayjs
			.duration(dayjs(form.getDateLimit).diff(new Date()))
			.format('HH:mm')

	seconds.value = getSeconds()
	while (seconds.value !== '00:00:00') {
		seconds.value = getSeconds()
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
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<!-- eslint-disable-next-line vue/no-v-for-template-key -->
		<template v-for="(item, i) in form.getItems" :key="i">
			<h3>
				{{ intToRoman(i + 1) }}.
				{{ item.title }}
			</h3>
			<LazyClassFormQuestion
				v-for="(question, j) in item.questions"
				:key="j"
				:question="question"
				:id-work="idForm"
				:number="sumAfters(i) + j + 1"
			/>
		</template>
		<template #questions>
			<div class="Questions">
				<span v-if="form.isWTime && form.getWorkStatus === 'opened'">
					{{ seconds }}
				</span>
				<div class="Questions__content">
					<NuxtLink
						v-for="(question, i) in form.getItems.flatMap(
							(i) => i.questions,
						)"
						:key="i"
						:class="question.answer !== '' ? 'Done' : ''"
						:to="`#pregunta${i}`"
					>
						{{ i + 1 }}
					</NuxtLink>
				</div>
				<HTMLButtonText
					v-if="form.getWorkStatus === 'opened'"
					color="white"
					:click="() => (modal = true)"
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
				<HTMLButtonText :click="() => (modal = false)">
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

@media (max-width: 767.98px) {
	h3 {
		font-size: 1.1rem;
	}

	span,
	button {
		font-size: 0.9rem;
	}
}

@media (max-width: 575.98px) {
	h3 {
		font-size: 1rem;
	}

	span,
	button {
		font-size: 0.8rem;
	}
}
</style>
