<script lang="ts" setup>
// Types
import { ErrorFetch } from '~/common/fetchModule'
import { RegisteredCalendarBlock } from '~/models/calendar/calendar.model'
import { Section } from '~/models/course/course.model'
import { Student } from '~/models/user/student.model'
import { User } from '~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Asistencia - ${schoolName} - Intranet`
	: 'Asistencia - Intranet'
// NuxtApp
const { $fetchModule, $courseService, $assistanceService, $calendarService } =
	useNuxtApp()
// Router
const router = useRouter()
const route = useRoute()

const idSection = route.params.section as string
const idBlock = route.params.block as string
// Modal
const modalSign = ref(false)
// Form
const assistance = ref<Array<{ student: string; assist: boolean }> | null>(null)
const digitalRandomKey = ref('')
const auditor = ref<User | null>(null)
const isSigned = ref(false)

// Data
const section = ref<Section | null>(null)
const students = ref<Array<Student> | null>(null)
const block = ref<RegisteredCalendarBlock | null>(null)
const error = ref<ErrorFetch | null>(null)

onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$courseService.getStudentsFromCourse(idSection),
			$courseService.getSection(idSection),
			$assistanceService.getCurrentAssistanceSection(idSection, idBlock),
		]).then(async (data) => {
			const block = await $calendarService.getRegisteredBlock(
				idBlock,
				data[1]._id,
			)

			return {
				section: data[1],
				students: data[0],
				assistance: data[2],
				block,
			}
		})

		block.value = dataFetch.block
		section.value = dataFetch.section
		// Students
		assistance.value = dataFetch.students.map((student) => ({
			student: student._id,
			assist: false,
		}))

		students.value = dataFetch.students
		// Assistance
		if (dataFetch.assistance) {
			assistance.value = dataFetch.assistance.assistance
			auditor.value = dataFetch.assistance.auditor
			isSigned.value = dataFetch.assistance.isSigned
		}
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

const fullCourseName = computed(
	() =>
		`${section.value?.course.course ?? ''} ${section.value?.section ?? ''}`,
)

// Signature
async function sign() {
	const isSign = await $assistanceService.sign(
		{
			date: new Date(),
			random_key: digitalRandomKey.value,
		},
		idSection,
		idBlock,
	)

	if (isSign) router.push('/asistencia')
}
</script>

<template>
	<section class="Assistance">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<h2>
			Asistencia {{ fullCourseName }} {{ block?.subject?.subject }}
			{{ formatDateLL(new Date()) }}
		</h2>

		<Assistance
			v-if="assistance && students"
			:auditor="auditor"
			:assistance="assistance"
			:students="students"
			:id-section="idSection"
			:id-block="idBlock"
			:full-course-name="fullCourseName"
			:is-signed="isSigned"
		/>
		<HTMLButtonText v-if="!isSigned" :click="() => (modalSign = true)">
			<i class="fa-solid fa-signature"></i>
			Firmar asistencia
		</HTMLButtonText>

		<SpinnerGet />
		<Error v-if="error" :err="error" />

		<!-- Modals -->
		<Modal v-model:opened="modalSign">
			<template #title>
				<h2>Firmar asistencia</h2>
			</template>
			<HTMLForm :form="sign">
				<label for="digital_key">OTP</label>
				<HTMLInput id="digital_key" v-model:value="digitalRandomKey" />

				<HTMLButton type="submit">Firmar</HTMLButton>
			</HTMLForm>
		</Modal>
	</section>
</template>

<style scoped>
.dark-mode .Assistance {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Assistance:first-child {
	box-shadow: var(--box-shadow);
}

.Assistance {
	width: 100%;
	margin: 20px;
	background-color: white;
	padding: 20px;
	border-radius: 15px;
}

h2 {
	margin-bottom: 15px;
}

@media (max-width: 575.98px) {
	h2 {
		font-size: 1.2rem;
	}

	.Assistance {
		margin: 10px;
	}
}
</style>
