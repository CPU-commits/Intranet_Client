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
	? `Materias - Admin - ${schoolName} - Intranet`
	: 'Materias - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $fetchModule, $courseService, $subjectService } = useNuxtApp()

// Modal
const modalSpecialty = ref(false)
const modalSubject = ref(false)
// Form
const specialty = ref('')
const subject: { subject: string; specialty: string; _id?: string } = reactive({
	subject: '',
	specialty: '',
})
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

// Specialties
async function newSpecialty() {
	const dataFetch = await $subjectService.newSpecialty(specialty.value)
	if (dataFetch !== undefined && specialties.value) {
		// Form
		specialty.value = ''
		specialties.value = [dataFetch, ...specialties.value]
	}
}

async function deleteSpecialty(id: string) {
	const dataFetch = await $subjectService.deleteSpecialty(id)
	if (dataFetch && specialties.value)
		specialties.value = specialties.value.filter(
			(specialty) => specialty._id !== id,
		)
}
// Subjects
async function newSubject() {
	const dataFetch = await $subjectService.newSubject(subject)
	if (dataFetch !== undefined && subjects.value && specialties.value) {
		const specialty = specialties.value.findIndex(
			(specialty) => specialty._id === subject.specialty,
		)
		// Form
		subject.subject = ''
		subject.specialty = ''
		// Data
		dataFetch.specialty = specialties.value[specialty]
		subjects.value = [dataFetch, ...subjects.value]

		modalSubject.value = false
	}
}

async function deleteSubject(id: string) {
	const dataFetch = await $subjectService.deleteSubject(id)
	if (dataFetch && subjects.value) {
		subjects.value = subjects.value.filter((subject) => subject._id !== id)
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
		<AdminPanel>
			<template #nav>
				<Icons>
					<HTMLButtonIcon
						:click="() => (modalSubject = true)"
						title="Agregar materia"
						class-item="fa-solid fa-plus"
					/>
					<HTMLButtonIcon
						:click="() => (modalSpecialty = true)"
						title="Especialidades"
						class-item="fa-solid fa-puzzle-piece"
					/>
				</Icons>
			</template>
			<h2>Materias</h2>
			<br />
			<!-- Data -->
			<HTMLTable
				v-if="subjects"
				:header="['Materia', 'Especialidad', '']"
			>
				<!-- eslint-disable-next-line vue/no-template-shadow -->
				<tr v-for="(subject, i) in subjects" :key="i">
					<td>{{ subject.subject }}</td>
					<td>
						{{
							subject.specialty
								? subject.specialty.specialty
								: 'Sin asignar'
						}}
					</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteSubject(subject._id)"
							type="button"
							class-item="fa-solid fa-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="subjects && subjects.length === 0"
				>No hay materias...</span
			>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modalSpecialty">
			<template #title>
				<h2>Especialidades</h2>
			</template>
			<HTMLForm :form="newSpecialty">
				<label for="specialty">Especialidad</label>
				<HTMLInput id="specialty" v-model:value="specialty" />
				<HTMLButton type="submit">Agregar especialidad</HTMLButton>
			</HTMLForm>
			<br />
			<HTMLTable v-if="specialties" :header="['Especialidad', '']">
				<!-- eslint-disable-next-line vue/no-template-shadow -->
				<tr v-for="(specialty, i) in specialties" :key="i">
					<td>{{ specialty.specialty }}</td>
					<td>
						<HTMLButtonIcon
							title="Eliminar especialidad"
							:click="() => deleteSpecialty(specialty._id)"
							class-item="fa-solid fa-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="specialties && specialties.length === 0"
				>No hay datos...</span
			>
		</Modal>

		<Modal v-model:opened="modalSubject">
			<template #title>
				<h2>Agregar materia</h2>
			</template>
			<HTMLForm :form="newSubject">
				<label for="subject">Materia</label>
				<HTMLInput id="subject" v-model:value="subject.subject" />
				<label for="specialty">Especialidad</label>
				<HTMLSelect id="specialty" v-model:value="subject.specialty">
					<option value="">Sin especialidad</option>
					<!-- eslint-disable vue/no-template-shadow -->
					<option
						v-for="(specialty, i) in specialties"
						:key="i"
						:value="specialty._id"
					>
						{{ specialty.specialty }}
					</option>
				</HTMLSelect>
				<HTMLButton type="submit">Agregar materia</HTMLButton>
			</HTMLForm>
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
