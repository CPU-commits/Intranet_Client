<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { GradeProgram } from '~~/models/classroom/grade.model'
import { GradeSee } from '~~/models/classroom/student_grade.model'
import { formatDate } from '~~/utils/format'

// Props
const props = defineProps<{
	gradePrograms: Array<GradeProgram>
	idModule: string
}>()
// Nuxtapp
const { $fetchModule, $gradesService } = useNuxtApp()

// Data
const grades = ref<Array<GradeSee> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		grades.value = await $gradesService.getStudentGrades(props.idModule)
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})
</script>

<template>
	<section class="GradeComponent">
		<h2>Calificaciones</h2>
		<HTMLTable :header="['Calificación', 'N°', 'Calificador', 'Fecha']">
			<!-- eslint-disable-next-line vue/no-v-for-template-key -->
			<template v-for="(grade, i) in grades" :key="i">
				<tr v-if="grade && !grade.is_acumulative">
					<td>{{ grade.grade }}</td>
					<td>{{ gradePrograms[i].number }}</td>
					<td v-if="grade.evaluator">
						{{ grade.evaluator.name }}
						{{ grade.evaluator.first_lastname }}
					</td>
					<td v-else>
						<i class="fa-solid fa-robot" />
						Calificaci&oacute;n autom&aacute;tica
					</td>
					<td>{{ formatDate(grade.date) }}</td>
				</tr>
				<tr
					v-for="(acumulative, j) in grade.acumulative"
					v-else-if="grade.is_acumulative"
					:key="j"
				>
					<template v-if="acumulative">
						<td>{{ acumulative.grade }}</td>
						<td>
							{{ gradePrograms[i].number }}
							(Acu: {{ gradePrograms[i].acumulative[j].number }})
						</td>
						<td>
							{{ acumulative.evaluator.name }}
							{{ acumulative.evaluator.first_lastname }}
						</td>
						<td>{{ formatDate(acumulative.date) }}</td>
					</template>
				</tr>
			</template>
		</HTMLTable>
		<span v-if="grades && grades.length === 0">
			No hay calificaciones
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
