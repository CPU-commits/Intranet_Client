<script setup lang="ts">
// Types
import type { Student } from '~~/models/user/student.model'
import { ErrorFetch } from '~~/common/fetchModule'

defineProps<{
	classItem: string
	text: string
	button: {
		isLink: boolean
		func?: (idStudent: string) => any
		href?: string
	}
}>()
// Nuxtapp
const { $fetchModule, $studentsService } = useNuxtApp()

// Data
const students = ref<Array<Student> | null>(null)

const error = ref<ErrorFetch | null>(null)
// Provide total for navigate
const total = ref(0)
provide('total', total)

async function getStudents(getTotal = false, skip?: number) {
	try {
		const dataFetch = await $studentsService.getStudents(
			getTotal,
			skip,
			search.value,
			true,
		)
		if (getTotal || !students.value) {
			students.value = dataFetch.users
			total.value = dataFetch.total ?? 0
		} else students.value.push(...dataFetch.users)
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}
// Form
const search = ref('')
</script>

<template>
	<section class="SearchStudents">
		<HTMLSearch
			v-model:value="search"
			placeholder="Buscar alumno"
			:search="() => getStudents(true)"
		/>
		<br />
		<HTMLTable
			:header="['Rut', 'Nombre', 'Curso', text]"
			:navigate="{
				max: 30,
				activate: true,
				fn(n) {
					getStudents(false, n)
				},
			}"
		>
			<tr v-for="student in students" :key="student._id">
				<td>{{ student.rut }}</td>
				<td>{{ student.name }} {{ student.first_lastname }}</td>
				<td v-if="student.course">
					{{ student.course.course.course }}
					{{ student.course.section }}
				</td>
				<td v-else>Sin curso</td>
				<td>
					<HTMLAIcon
						v-if="button.isLink && button.href"
						:href="button.href"
						:class-item="classItem"
					/>
					<HTMLButtonIcon
						v-else-if="!button.isLink && button.func"
						:click="() => (button.func as Function)(student._id)"
						type="button"
						:class-item="classItem"
					/>
				</td>
			</tr>
		</HTMLTable>
		<span v-if="students && students.length === 0">No hay alumnos...</span>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped>
.dark-mode .SearchStudents {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .SearchStudents {
	box-shadow: var(--box-shadow);
}

.SearchStudents {
	width: 100%;
	background-color: white;
	border-radius: 15px;
}

@media (max-width: 575.98px) {
	.SearchStudents {
		margin: 10px;
	}
}
</style>
