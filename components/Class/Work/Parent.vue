<!-- eslint-disable camelcase -->
<!-- eslint-disable vue/no-setup-props-destructure -->
<script setup lang="ts">
// Types
import type { StudentAccess } from '~~/models/classroom/students_access.model'
import { Work } from '~~/models/classroom/work.model'
// Props
const { students, work, idWork, totalPoints, formHasPoints } = defineProps<{
	students: Array<StudentAccess>
	work: Work
	idWork: string
	totalPoints: number
	formHasPoints: boolean
}>()
// Nuxtapp
const { $workService, $filesService } = useNuxtApp()

const evaluateFiles: any = reactive({})

function initEvaluateFiles() {
	work.pattern.forEach((item) => {
		evaluateFiles[item?._id ?? ''] = ''
	})
}

if (work.type === 'files') initEvaluateFiles()
// Headers
const header: Array<string> = ['Estudiante', 'RUT']

function getStudentStatusForm(student: StudentAccess) {
	if (!student.access) return 'Sin abrir formulario'
	if (student.access.status === 'opened') return 'Formulario en resolución'
	if (student.access.status === 'finished') return 'Formulario finalizado'
	if (student.access.status === 'revised')
		return 'Formulario evaluado/revisado'
}
// Set headers
const now = new Date()

if (work.type === 'form') {
	header.push('Acceso')
	if (dateIsBefore(work.date_limit, now) && formHasPoints)
		header.push('Evaluado (%)', 'Puntaje', 'Respuestas')
	if (!formHasPoints) header.push('Ver respuestas')
} else if (work.type === 'files') {
	header.push('Estado')
	if (dateIsBefore(work.date_limit, now)) {
		header.push(
			'<i class="fa-solid fa-file-arrow-up"></i> Archivos',
			'Fecha de Subida',
			'Puntaje',
		)
	}
} else if (work.type === 'in-person') {
	if (dateIsBefore(work.date_limit, now) && work.is_revised)
		header.push('Calificación')
}

function getStudentStatusFiles(student: StudentAccess) {
	if (!student.files_uploaded) return 'Sin entrega de archivos'
	return 'Archivos entregados'
}

async function downloadFiles(idStudent: string, index: number) {
	const urlToken = await $workService.downloadFiles(idStudent, work._id)
	if (urlToken) {
		const studentName = `${students[index].user.rut} ${students[index].user.name} ${students[index].user.first_lastname}`
		$filesService.downloadFileUrl(urlToken, `${studentName}.zip`)
	}
}
</script>

<template>
	<section
		v-if="
			dateIsBefore(work.date_limit, new Date()) ||
			work.type !== 'in-person'
		"
	>
		<HTMLTable :header="header">
			<tr v-for="(student, i) in students" :key="i">
				<td>
					{{ student.user.name }}
					{{ student.user.first_lastname }}
					{{ student.user.second_lastname }}
				</td>
				<td>{{ student.user.rut }}</td>
				<td v-if="work.type !== 'in-person'">
					{{
						work.type === 'form'
							? getStudentStatusForm(student)
							: getStudentStatusFiles(student)
					}}
				</td>
				<template v-if="dateIsBefore(work.date_limit, now)">
					<template v-if="work.type === 'form'">
						<template v-if="formHasPoints">
							<td>
								<i
									v-if="
										student.access &&
										student.evaluate?.percentage !== 100
									"
									style="color: var(--color-warning)"
									title="Por evaluar"
									class="fa-solid fa-circle-exclamation"
								/>
								{{
									student.access
										? student?.evaluate?.percentage
										: '100'
								}}%
							</td>
							<td>
								{{
									student.access
										? student?.evaluate?.points_total
										: '0'
								}}
								/{{ totalPoints }}
							</td>
							<td>
								<HTMLAIcon
									v-if="
										student.access &&
										student.access.status !== 'opened'
									"
									:href="`/aula_virtual/formulario/${idWork}/estudiante/${student.user._id}`"
									target="_blank"
									title="Evaluar formulario"
									class-item="fa-solid fa-clipboard"
								/>
								<i v-else class="fa-solid fa-ban" />
							</td>
						</template>
						<td v-else>
							<HTMLAIcon
								target="_blank"
								:href="`/aula_virtual/formulario/${idWork}/estudiante/${student.user._id}`"
								class-item="fa-solid fa-r"
							/>
						</td>
					</template>
					<template
						v-else-if="
							work.type === 'files' &&
							dateIsBefore(work.date_limit, now)
						"
					>
						<td v-if="student.files_uploaded">
							<HTMLButton
								:click="
									() => downloadFiles(student.user._id, i)
								"
								type="button"
							>
								<i class="fa-solid fa-file-arrow-down" />
							</HTMLButton>
						</td>
						<td v-else>
							<i class="fa-solid fa-ban" />
						</td>
						<td
							:class="
								dateIsBefore(
									student?.files_uploaded?.date,
									work.date_limit,
								)
									? 'Success'
									: 'Fail'
							"
						>
							<p v-if="student?.files_uploaded?.date">
								{{
									formatDate(
										student?.files_uploaded?.date ?? '',
									)
								}}
							</p>
							<p v-else>No entregado</p>
							{{
								dateIsBefore(
									student?.files_uploaded?.date,
									work.date_limit,
								)
									? '(A tiempo)'
									: '(Atrasado)'
							}}
						</td>
						<td>
							{{
								student?.files_uploaded?.evaluate
									? student.files_uploaded.evaluate.reduce(
											(a, b) => {
												return a + b.points
											},
											0,
									  )
									: '0'
							}}
							/{{ totalPoints }}
						</td>
					</template>
					<template v-else-if="work.type === 'in-person'">
						<td>{{ student.session.pregrade }}</td>
					</template>
				</template>
			</tr>
		</HTMLTable>
		<span
			v-if="dateIsBefore(work.date_limit, now) && work.is_revised"
			class="Revised"
		>
			<i class="fa-solid fa-circle-check" /> Trabajo revisado
		</span>
		<span v-else-if="dateIsBefore(work.date_limit, now)" class="Revised">
			<strong>
				<i>Preeliminar</i> > Trabajo todav&iacute;a sin revisar por
				completo
			</strong>
		</span>
	</section>
</template>

<style lang="scss" scoped>
span {
	color: white;
}

.Revised {
	color: var(--color-main);
	font-weight: bold;
	i {
		color: var(--color-main);
	}
}

button i {
	color: white;
}

.Success {
	color: var(--color-main);
}

.Fail {
	color: var(--color-danger);
}

@media (max-width: 575.98px) {
	.Revised {
		font-size: 0.85rem;
	}
}
</style>
