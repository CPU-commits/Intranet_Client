<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { GradeProgram } from '~~/models/classroom/grade.model'
import { StudentGrade } from '~~/models/classroom/student_grade.model'

// Props
const props = defineProps<{
	gradePrograms: Array<GradeProgram>
	idModule: string
}>()
// Nuxtapp
const { $fetchModule, $gradesService } = useNuxtApp()

// Data
const students = ref<Array<StudentGrade> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		students.value = await $gradesService.getStudentsGrades(props.idModule)
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})
</script>

<template>
	<section class="GradeComponent">
		<h2>Calificaciones</h2>
		<!-- Data -->
		<HTMLTable
			v-if="students"
			:header="[
				'Estudiante',
				...gradePrograms.map((program) => {
					return `${program.number}° (${program.percentage}%)`
				}),
				'Prom. Total',
			]"
		>
			<tr v-for="(student, i) in students" :key="i">
				<td>
					{{ student.student.rut }}
					{{ student.student.name }}
					{{ student.student.first_lastname }}
				</td>
				<td v-for="(grade, j) in student.grades" :key="j">
					{{ grade?.grade ? grade.grade : 'N/A' }}
				</td>
				<td>
					{{
						student.grades
							.reduce((a, grade, i) => {
								if (grade) {
									return (
										a +
										(grade.grade *
											gradePrograms[i].percentage) /
											100
									)
								}
								return a
							}, 0)
							.toFixed(2)
					}}
				</td>
			</tr>
		</HTMLTable>
		<span v-if="students && students.length === 0">
			No hay estudiantes...
		</span>

		<br />
		<h3>
			<i class="fa-solid fa-robot" /> Programaci&oacute;n de
			calificaciones
		</h3>
		<HTMLTable :header="['N°', 'Porcentaje', 'Acumulativo']">
			<tr v-for="(program, i) in gradePrograms" :key="i">
				<td>{{ program.number }}</td>
				<td>{{ program.percentage }}%</td>
				<td>
					{{
						!program.is_acumulative
							? 'No aplica'
							: program.acumulative
									.map(
										(acumulative) =>
											`${acumulative.number}°[${acumulative.percentage}%] `,
									)
									.join('')
					}}
				</td>
			</tr>
		</HTMLTable>
		<span v-if="gradePrograms.length === 0">
			Todav&iacute;a ninguna programaci&oacute;n
		</span>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped>
h3 {
	margin-top: 10px;
}

i {
	color: var(--color-main);
}
</style>
