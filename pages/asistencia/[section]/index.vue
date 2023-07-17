<script lang="ts" setup>
// Types
import { ErrorFetch } from '~/common/fetchModule'
import { Section } from '~/models/course/course.model'
import { Student } from '~/models/user/student.model'
import { User } from '~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Asistencia - ${schoolName} - Intranet`
	: 'Asistencia - Intranet'
// NuxtApp
const { $fetchModule, $courseService, $assistanceService } = useNuxtApp()
// Router
const route = useRoute()

const idSection = route.params.section as string
// Form
const assistance = ref<Array<{ student: string; assist: boolean }> | null>(null)
const auditor = ref<User | null>(null)

// Data
const section = ref<Section | null>(null)
const students = ref<Array<Student> | null>(null)
const error = ref<ErrorFetch | null>(null)

onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$courseService.getStudentsFromCourse(idSection),
			$courseService.getSection(idSection),
			$assistanceService.getCurrentAssistanceSection(idSection),
		]).then((data) => {
			return {
				section: data[1],
				students: data[0],
				assistance: data[2],
			}
		})

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
		}
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

const fullCourseName = computed(
	() =>
		`${section.value?.course.course ?? ''} ${section.value?.section ?? ''}`,
)
</script>

<template>
	<section class="Assistance">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<h2>Asistencia {{ fullCourseName }} {{ formatDateLL(new Date()) }}</h2>

		<Assistance
			v-if="assistance && students"
			:auditor="auditor"
			:assistance="assistance"
			:students="students"
			:id-section="idSection"
			:full-course-name="fullCourseName"
		/>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped>
.dark-mode .Assistance {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Assistance {
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
