<script setup lang="ts">
// Types
import type { Specialty } from '~~/models/subject/specialty.model'
import type { Subject } from '~~/models/subject/subject.model'
import type { Course } from '~~/models/course/course.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Anclaje - Admin - ${schoolName} - Intranet`
	: 'Anclaje - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $fetchModule, $courseService, $subjectService } = useNuxtApp()

// Modal
const modalCourseSubjects = ref(false)
const toggleCourseSubjects = (id: string, index: number) => {
	subjectAnchor.value = ''
	courseId.value = id
	coursePosition.value = index
	modalCourseSubjects.value = !modalCourseSubjects.value
	if (courses.value) courseEdit.value = courses.value[index]
}

const subjectAnchor = ref('')
// Anchor
const courseId = ref('')
const courseEdit = ref<Course | null>(null)
const coursePosition = ref(0)
// Data
const subjects = ref<Array<Subject> | null>(null)
const specialties = ref<Array<Specialty> | null>(null)
const courses = ref<Array<Course> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$subjectService.getSubjects(),
			$subjectService.getSpecialties(),
			$courseService.getCourses(),
		])
		// Assign
		subjects.value = dataFetch[0]
		specialties.value = dataFetch[1]
		courses.value = dataFetch[2]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

// Anchor
async function addSubject() {
	const cPosition = coursePosition.value
	const dataFetch = await $subjectService.addSubject(
		subjectAnchor.value,
		courseId.value,
	)
	if (dataFetch && courses.value) {
		// Add subject
		courses.value[cPosition].subjects.push(dataFetch)
		courseEdit.value = courses.value[cPosition]
	}
}

async function deleteSubjectCourse(idSubject: string) {
	const cPosition = coursePosition.value
	const dataFetch = await $subjectService.deleteSubjectCourse(
		idSubject,
		courseId.value,
	)
	if (dataFetch && courses.value) {
		courses.value[cPosition].subjects = courses.value[
			cPosition
		].subjects.filter((subject) => (subject as Subject)._id !== idSubject)
	}
}
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
				Anclaje Materias - Cursos (<i
					class="fa-solid fa-book-bookmark"
				/>
				- <i class="fa-solid fa-layer-group"></i>)
			</h2>
			<br />
			<!-- Data -->
			<HTMLTable v-if="subjects" :header="['Curso', 'Materias']">
				<tr v-for="(course, i) in courses" :key="i">
					<td>{{ course.course }}</td>
					<td>
						<HTMLButtonIcon
							:click="() => toggleCourseSubjects(course._id, i)"
							type="button"
							class-item="fa-solid fa-book-bookmark"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="subjects && subjects.length === 0">
				No hay cursos...
			</span>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modalCourseSubjects">
			<template #title>
				<h2 v-if="courses">
					Materias {{ courses[coursePosition].course }}
				</h2>
			</template>
			<HTMLForm v-if="courseEdit" :form="addSubject">
				<label for="subject-a">Materia</label>
				<HTMLSelect id="subject-a" v-model:value="subjectAnchor">
					<option value="">Selecione una materia</option>
					<option
						v-for="(subject, i) in subjects?.filter(
							(subject) =>
								!courseEdit?.subjects.some(
									(s) => s._id === subject._id,
								),
						)"
						:key="i"
						:value="subject._id"
					>
						{{ subject.subject }}
					</option>
				</HTMLSelect>
				<HTMLButton v-if="courses" type="submit">
					Agregar anclaje a {{ courses[coursePosition].course }}
				</HTMLButton>
			</HTMLForm>
			<br />
			<HTMLTable v-if="courseEdit" :header="['Materia', '']">
				<tr v-for="(subject, i) in courseEdit.subjects" :key="i">
					<td>{{ subject.subject }}</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteSubjectCourse(subject._id)"
							class-item="fa-solid fa-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="courseEdit && courseEdit.subjects.length === 0"
				>No hay datos...</span
			>
		</Modal>
	</NuxtLayout>
</template>

<style scoped>
h2 i {
	color: var(--color-main);
	font-size: 20px;
}

i {
	color: white;
}

@media (max-width: 575.98px) {
	h2 i {
		font-size: 1rem;
	}
}
</style>
