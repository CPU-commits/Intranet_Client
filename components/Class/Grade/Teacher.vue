<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import type { GradeProgram } from '~~/models/classroom/grade.model'
import type {
	GradeSee,
	StudentGrade,
} from '~~/models/classroom/student_grade.model'
import type { User } from '~~/models/user/user.model'
import { formatDate } from '~~/utils/format'
type Acumulative = {
	percentage: string
	number?: number
}
// Props
const props = defineProps<{
	gradePrograms: Array<GradeProgram>
	idModule: string
}>()

const gradePrograms = toRef(props, 'gradePrograms')
// Nuxtapp
const { $fetchModule, $gradesService, $filesService } = useNuxtApp()
// Stores
const auth = useAuthStore()

// Modal
const modalProgramGrades = ref(false)
const modalSeePrograms = ref(false)
const modalGrade = ref(false)
const modalAddGrade = ref(false)

// Form
const program = reactive({
	number: '',
	percentage: '',
	is_acumulative: 'false',
	acumulative: [] as Acumulative[],
})

// Init variables
const gradeAdd = ref('')
const gradeSee = ref<GradeSee | null>(null)
const studentSee = ref<User | null>(null)
const gradeAcumulative = ref<Array<string>>([])
const programIndex = ref(0)
const studentIndex = ref(0)
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

// Functions
function addAcumulative() {
	program.acumulative = [
		...program.acumulative,
		{
			percentage: '',
		},
	]
}

function deleteAcumulative(index: number) {
	program.acumulative.splice(index, 1)
}

async function uploadProgram() {
	const uploadedProgram = await $gradesService.uploadProgram(
		props.idModule,
		program,
	)
	if (uploadedProgram && students.value) {
		gradePrograms.value.push(uploadedProgram)
		students.value.map((student) => {
			const grades = student.grades
			grades.push(null)
			return {
				...student,
				grades,
			}
		})
	}
}

async function deleteProgram(idProgram: string, index: number) {
	const deleted = await $gradesService.deleteProgram(
		idProgram,
		props.idModule,
	)
	if (deleted) gradePrograms.value.splice(index, 1)
}

// Grade
async function addGrade(acumulative?: string) {
	const index = programIndex.value
	// Init index acumulative
	let indexAcumulative: number | undefined
	// Build data
	const data: { grade?: number; program: string; acumulative?: string } = {
		program: gradePrograms.value[index]._id,
	}
	if (!acumulative) {
		// Grade add form
		if (gradeAdd.value === '')
			throw new Error('Se necesita una calificación')
		data.grade = parseFloat(gradeAdd.value)
	} else {
		// Search index acumulative
		indexAcumulative = gradePrograms.value[index].acumulative.findIndex(
			(a) => {
				return a._id === acumulative
			},
		)
		if (gradeAcumulative.value[indexAcumulative] === '')
			throw new Error('Se necesita una calificación')
		// Add to data
		data.grade = parseFloat(gradeAcumulative.value[indexAcumulative])
		data.acumulative = acumulative
	}
	// Fetch data
	const idInserted = await $gradesService.addGrade(
		data,
		props.idModule,
		studentSee.value?._id ?? '',
	)

	if (idInserted && students.value) {
		// Search grade
		let grade: number
		if (!acumulative) {
			grade = data.grade
		} else {
			// If not exists gradeSee, init in 0
			grade = gradeSee.value?.grade ? gradeSee.value.grade : 0
			// Sum grade acumulative to grade
			const indexAc: number = indexAcumulative as number
			grade +=
				(data.grade *
					gradePrograms.value[index].acumulative[indexAc]
						.percentage) /
				100
		}
		// Update grade to student for both (acumulative/!acumulative)
		students.value[studentIndex.value].grades[index] = {
			...students.value[studentIndex.value].grades[index],
			is_acumulative: gradePrograms.value[index].is_acumulative,
			grade,
		} as GradeSee
		if (!acumulative) {
			// Update for only !acumulative
			students.value[studentIndex.value].grades[index] = {
				...students.value[studentIndex.value].grades[index],
				_id: idInserted,
				grade: data.grade,
				date: new Date().toISOString(),
				evaluator: {
					name: auth?.getName ?? '',
					first_lastname: '',
				},
			} as GradeSee
		} else {
			const gradeCopy = students.value[studentIndex.value].grades[index]
			// Update for only acumulative
			if (!gradeCopy?.acumulative && gradeCopy) gradeCopy.acumulative = []
			const indexAc = indexAcumulative as number
			;(gradeCopy as GradeSee).acumulative[indexAc] = {
				_id: idInserted,
				grade: data.grade,
				evaluator: {
					name: auth?.getName ?? '',
					first_lastname: '',
				},
				date: new Date().toISOString(),
			}
			gradeSee.value = students.value[studentIndex.value].grades[index]
		}
		modalAddGrade.value = false
	}
}

async function updateGrade(isAcumulative: boolean, index?: number) {
	let grade: string | undefined
	let gradeId: string | undefined

	if (!isAcumulative && gradeSee.value) {
		grade = gradeSee.value.grade.toString()
		gradeId = gradeSee.value._id ?? ''
	} else if (index !== undefined && gradeSee.value) {
		grade = gradeSee.value.acumulative[index].grade.toString()
		gradeId = gradeSee.value.acumulative[index]._id
	}
	const gradeVal = parseFloat(grade ?? '')

	const updated = await $gradesService.updateGrade(
		props.idModule,
		gradeId ?? '',
		gradeVal,
	)
	if (updated && students.value) {
		const gradeCopy =
			students.value[studentIndex.value].grades[programIndex.value]
		if (gradeCopy) {
			if (!isAcumulative) {
				gradeCopy.grade = gradeVal
			} else if (index !== undefined) {
				gradeCopy.acumulative[index].grade = gradeVal
				const grades = gradeCopy.acumulative

				gradeCopy.grade = grades.reduce((a, grade, i) => {
					if (grade)
						return (
							a +
							(grade.grade *
								gradePrograms.value[programIndex.value]
									.acumulative[i].percentage) /
								100
						)
					return a
				}, 0)
			}
		}
	}
}

async function exportGrades() {
	const urlToken = await $gradesService.exportGrades(props.idModule)
	if (urlToken) $filesService.downloadFileUrl(urlToken, `calificaciones.xlsx`)
}
</script>

<template>
	<section class="GradeComponent">
		<header>
			<Icons>
				<HTMLButtonIcon
					title="Programar calificaciones"
					:click="() => (modalProgramGrades = true)"
					class-item="fa-solid fa-flag"
				/>
				<HTMLButtonIcon
					title="Ver programación calificaciones"
					:click="() => (modalSeePrograms = true)"
					class-item="fa-solid fa-chart-pie"
				/>
				<HTMLButtonIcon
					title="Exportar Excel Con calificaciones"
					:click="exportGrades"
					class-item="fa-solid fa-file-export"
				/>
			</Icons>
		</header>
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
					<HTMLButtonText
						v-if="grade || gradePrograms[j]?.is_acumulative"
						:click="
							() => {
								modalGrade = true
								programIndex = j
								if (grade)
									gradeSee = JSON.parse(JSON.stringify(grade))
								studentSee = student.student
								studentIndex = i
								if (gradePrograms[j].is_acumulative)
									gradeAcumulative = Array(
										gradePrograms[j].acumulative.length,
									)
							}
						"
					>
						{{ grade?.grade ? grade.grade : 'N/A' }}
					</HTMLButtonText>
					<HTMLButtonText
						v-else
						:click="
							() => {
								modalAddGrade = true
								gradeAdd = ''
								programIndex = j
								studentIndex = i
								gradeSee = JSON.parse(JSON.stringify(grade))
								studentSee = student.student
							}
						"
					>
						N/A
					</HTMLButtonText>
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

		<SpinnerGet />
		<Error v-if="error" :err="error" />

		<!-- Modals -->
		<Modal v-model:opened="modalProgramGrades">
			<template #title>
				<h2>Programar calificaci&oacute;n</h2>
			</template>
			<HTMLForm :form="uploadProgram">
				<label for="number">Calificaci&oacute;n n°</label>
				<HTMLSelect id="number" v-model:value="program.number">
					<option value="">Seleccione una opci&oacute;n</option>
					<option v-for="i in 30" :key="i" :value="i">
						{{ i }}°
					</option>
				</HTMLSelect>
				<label for="percentage">Porcentaje calificaci&oacute;n</label>
				<HTMLInput
					id="percentage"
					v-model:value="program.percentage"
					type="number"
				/>
				<label for="is_acumulative">Tipo de calificaci&oacute;n</label>
				<HTMLSelect
					id="is_acumulative"
					v-model:value="program.is_acumulative"
				>
					<option value="false">Calificaci&oacute;n directa</option>
					<option value="true">Acumulativa</option>
				</HTMLSelect>
				<div v-if="program.is_acumulative === 'true'">
					<h3>Calificaciones acumulativas</h3>
					<div
						v-for="(acumulative, i) in program.acumulative"
						:key="i"
						class="Inline"
					>
						<span>{{ i + 1 }})</span>
						<HTMLInput
							v-model:value="acumulative.percentage"
							:placeholder="`Porcentaje calificación ${i + 1}°`"
						/>
						<HTMLButtonIcon
							class-item="fa-solid fa-circle-minus"
							:click="() => deleteAcumulative(i)"
							:one-hundred="false"
						/>
					</div>
					<HTMLButtonIcon
						class-item="fa-solid fa-plus"
						:click="addAcumulative"
						title="Agregar calificación acumulativa"
					/>
				</div>
				<HTMLButton type="submit">Subir programaci&oacute;n</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalSeePrograms">
			<template #title>
				<h2>Programas de calificaciones</h2>
			</template>
			<HTMLTable :header="['N°', 'Porcentaje', 'Acumulativo', '']">
				<tr v-for="(program, i) in gradePrograms" :key="program._id">
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
					<td>
						<HTMLButtonIcon
							hover="var(--color-danger)"
							:click="() => deleteProgram(program._id, i)"
							title="Eliminar programación"
							:one-hundred="false"
							class-item="fa-solid fa-circle-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="gradePrograms.length === 0">
				Todav&iacute;a ninguna programaci&oacute;n
			</span>
		</Modal>

		<Modal v-model:opened="modalGrade">
			<template #title>
				<h2>
					Calificaci&oacute;n
					{{ gradePrograms[programIndex].number }}° ({{
						gradePrograms[programIndex].percentage
					}}%)
				</h2>
			</template>
			<div v-if="gradePrograms[programIndex].is_acumulative">
				<h3>Acumulativa:</h3>
				<article
					v-for="(program, i) in gradePrograms[programIndex]
						.acumulative"
					:key="i"
				>
					<h4>
						Acumulativa {{ program.number }}° ({{
							program.percentage
						}}%)
					</h4>
					<HTMLForm
						v-if="gradeSee?.acumulative && gradeSee.acumulative[i]"
						:form="() => updateGrade(true, i)"
					>
						<HTMLInput
							v-model:value="gradeSee.acumulative[i].grade"
						/>
						<HTMLButton type="submit"
							>Editar calificaci&oacute;n</HTMLButton
						>
						<footer class="Info">
							<small>
								Evaluado por
								<span class="Evaluator">
									{{ gradeSee.acumulative[i].evaluator.name }}
									{{
										gradeSee.acumulative[i].evaluator
											.first_lastname
									}}
								</span>
							</small>
							<small>
								{{ formatDate(gradeSee.acumulative[i].date) }}
							</small>
						</footer>
					</HTMLForm>
					<HTMLForm v-else :form="() => addGrade(program._id)">
						<HTMLInput v-model:value="gradeAcumulative[i]" />
						<HTMLButton type="submit"
							>Subir calificaci&oacute;n</HTMLButton
						>
					</HTMLForm>
					<br />
				</article>
			</div>
			<div v-else-if="gradeSee">
				<HTMLForm :form="() => updateGrade(false)">
					<label for="grade">Calificaci&oacute;n</label>
					<HTMLInput v-model:value="gradeSee.grade" />
					<HTMLButton type="submit">
						Editar calificaci&oacute;n
					</HTMLButton>
				</HTMLForm>
				<footer class="Info">
					<small>
						Evaluado por
						<span class="Evaluator">
							<span v-if="gradeSee.evaluator">
								{{ gradeSee.evaluator.name }}
								{{ gradeSee.evaluator.first_lastname }}
							</span>
							<span v-else>
								<i class="fa-solid fa-robot" />
								Calificaci&oacute;n autom&aacute;tica
							</span>
						</span>
					</small>
					<small>{{ formatDate(gradeSee.date) }}</small>
				</footer>
			</div>
		</Modal>

		<Modal v-model:opened="modalAddGrade">
			<template #title>
				<h2>Agregar calificaci&oacute;n</h2>
			</template>
			<HTMLForm :form="() => addGrade()">
				<label for="grade">Calificaci&oacute;n</label>
				<HTMLInput v-model:value="gradeAdd" type="number" />
				<HTMLButton type="submit">
					Subir calificaci&oacute;n
				</HTMLButton>
			</HTMLForm>
		</Modal>
	</section>
</template>

<style scoped>
header {
	border: 2px solid var(--color-main);
	padding: 8px;
	margin-bottom: 10px;
}

.Inline {
	display: flex;
	gap: 5px;
	align-items: center;
}

.Info {
	display: flex;
	margin-top: 20px;
	justify-content: space-between;
	align-items: center;
}

.Evaluator,
.Evaluator span {
	color: var(--color-main);
	font-weight: bold;
}
</style>
