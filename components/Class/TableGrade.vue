<script setup lang="ts">
// Types
import type { GradeProgram } from '~~/models/classroom/grade.model'
import type {
	GradeSee,
	StudentGrade,
} from '~~/models/classroom/student_grade.model'

const props = defineProps<{
	moduleGrades: {
		gradesProgram: Array<GradeProgram>
		grades: Array<StudentGrade>
	} | null
}>()

const calculateAverage = (grades: Array<GradeSee | null>) => {
	return grades
		.reduce((a, grade, i) => {
			if (grade) {
				const percentage =
					props.moduleGrades?.gradesProgram[i].percentage ?? 1
				return a + (grade.grade * percentage) / 100
			}
			return a
		}, 0)
		.toFixed(2)
}
</script>

<template>
	<HTMLTable
		v-if="moduleGrades?.gradesProgram"
		:header="[
			'Estudiante',
			...moduleGrades.gradesProgram.map((program) => {
				return `${program.number}° (${program.percentage}%)`
			}),
			'Prom. Total',
		]"
	>
		<tr
			v-for="(student, i) in moduleGrades.grades"
			v-if="moduleGrades.grades.length > 0"
			:key="i"
		>
			<td>
				{{ student.student.rut }}
				{{ student.student.name }}
				{{ student.student.first_lastname }}
			</td>
			<td v-for="(grade, j) in student.grades" :key="j">
				<span
					v-if="grade || moduleGrades.gradesProgram[j].is_acumulative"
				>
					{{ grade?.grade ? grade.grade : 'N/A' }}
				</span>
				<span v-else>N/A</span>
			</td>
			<td>{{ calculateAverage(student.grades) }}</td>
		</tr>

		<span v-else>No hay estudiantes...</span>
	</HTMLTable>
	<span v-else>No hay calificaciones programadas</span>
</template>
