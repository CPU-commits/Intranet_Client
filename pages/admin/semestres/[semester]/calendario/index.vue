<script setup lang="ts">
// Types
import { Section } from '~/models/course/course.model'
import { ErrorFetch } from '~~/common/fetchModule'
import type { Semester } from '~~/models/semester/semester.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Calendario de Semestre - Admin - ${schoolName} - Intranet`
	: 'Calendario de Semestre - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $semesterService, $fetchModule, $courseService } = useNuxtApp()
// Router
const route = useRoute()

const idSemester = route.params.semester as string
// Form
const section = ref('')
const course = computed(() => {
	return sections.value?.find(({ _id }) => _id === section.value)?.course._id
})
// Data
const semester = ref<Semester | null>(null)
const sections = ref<Array<Section> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$semesterService.getSemester(idSemester),
			$courseService.getSections(),
		])

		semester.value = dataFetch[0]
		sections.value = dataFetch[1]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})
</script>

<template>
	<NuxtLayout name="admin">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<AdminPanel :nav="false">
			<h2>
				Calendario de Semestre {{ semester?.semester }}°
				{{ semester?.year }}
			</h2>
			<br />
			<!-- Data -->
			<HTMLTextCarousel
				v-if="sections"
				v-model:select="section"
				:labels="
					sections?.map((section) => ({
						text: `${section.course.course} ${section.section}`,
						value: section._id,
					}))
				"
			/>
			<!-- Data - Calendar Course -->
			<Calendar
				v-if="course && section !== '' && semester?.status !== 0"
				:id-section="section"
				:id-course="course"
				:id-semester="idSemester"
				:editable="semester?.status === 2"
			/>
			<span v-else-if="semester?.status === 0">
				Todav&iacute;a no se puede ver el calendario de este semestre
			</span>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>
	</NuxtLayout>
</template>

<style scoped>
td i {
	color: white;
}

span {
	width: 100%;
	text-align: center;
	font-style: italic;
	color: var(--color-main);
	font-weight: bold;
	font-size: 1.3rem;
}
</style>
