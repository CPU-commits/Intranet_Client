<script setup lang="ts">
// Types
import { Assistance as AssistanceType } from '~/models/assistance/assistance'
import { Section } from '~/models/course/course.model'
import { FetchGet } from '~/models/fetch/defaults.model'
import { Student } from '~/models/user/student.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import { User, UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Asistencia - Admin - ${schoolName} - Intranet`
	: 'Asistencia - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTIVE, UserTypesKeys.DIRECTOR],
})
// Nuxt App
const { $fetchModule, $courseService, $assistanceService } = useNuxtApp()
// Stores
const toastsStore = useToastsStore()
// Router
const route = useRoute()

// const idSemester = route.params.semester as string
const idSection = route.params.section as string
// Modal
const modalAdd = ref(false)
const modalAsssistance = ref(false)
const modalStudents = ref(false)

let ignore = false
watch(modalAdd, async (newModal) => {
	if (newModal) {
		if (!students.value)
			students.value = await $courseService
				.getStudentsFromCourse(idSection)
				.then((students) =>
					students.map((student) => ({
						...student,
						original: true,
					})),
				)
		if (students.value && !ignore)
			newAssistance.value.assistance = students.value.map((student) => ({
				student: student._id,
				assist: false,
				exists: true,
			}))
		ignore = false
	}
})
// Form
const newAssistance = ref({
	date: '',
	assistance: [] as Array<{
		student: string
		assist: boolean
		exists?: boolean
	}>,
})
const warnings = ref<Array<{ warning: string; student: string }>>([])

const indexAss = ref(0)
const copyAssistance = ref<Array<{ student: string; assist: boolean }> | null>(
	null,
)
// Data
const section = ref<Section | null>(null)
const students = ref<Array<Student & { original: boolean }> | null>(null)
const assistances = ref<Array<AssistanceType<User>> | null>(null)
const error = ref<ErrorFetch | null>(null)

// Total
const total = ref(0)
provide('total', total)

onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$courseService.getSection(idSection),
			getAssistances({ total: true }),
		]).then((data) => {
			return {
				section: data[0],
			}
		})

		// Section
		section.value = dataFetch.section
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

const fullCourseName = computed(
	() =>
		`${section.value?.course.course ?? ''} ${section.value?.section ?? ''}`,
)

async function getAssistances(params?: FetchGet) {
	const dataFetch = await $assistanceService.getAssistancesSection(
		idSection,
		params,
	)

	// Assistances
	assistances.value = dataFetch.assistances
	total.value = dataFetch.total
}

// Functions
function updateAssistance(
	newAssistance: Array<{
		student: string
		assist: boolean
	}>,
) {
	if (assistances.value)
		assistances.value[indexAss.value].assistance = newAssistance.map(
			(ass) => {
				return {
					assist: ass.assist,
					student: (assistances.value as Array<AssistanceType<User>>)[
						indexAss.value
					].assistance.find(
						(assistance) => assistance.student._id === ass.student,
					)?.student as User,
				}
			},
		)
}

function addStudent(student: Student) {
	// Close modal
	modalStudents.value = false
	modalAdd.value = true

	// Add warning and student
	newAssistance.value.assistance.push({
		student: student._id,
		assist: false,
	})
	students.value?.push({
		...student,
		original: false,
	})

	warnings.value.push({
		warning: `El estudiante ${student.name} ${student.first_lastname} no pertenece actualmente al curso`,
		student: student._id,
	})
}

function removeStudent(student: User) {
	// Student
	const studentIndex = students.value?.findIndex(
		(user) => user._id === student._id,
	)
	if (students.value && studentIndex !== undefined) {
		if (!students.value[studentIndex].original) {
			students.value?.splice(studentIndex, 1)
			newAssistance.value.assistance.splice(studentIndex, 1)

			warnings.value = warnings.value.filter(
				(warning) => warning.student !== student._id,
			)
		} else {
			// Assistance
			const assistance = newAssistance.value.assistance.find(
				(ass) => ass.student === student._id,
			)
			if (assistance) assistance.exists = !assistance.exists
			if (!assistance?.exists)
				warnings.value.push({
					student: student._id,
					warning: `El estudiante ${student.name} ${student.first_lastname} pertenece actualmente al curso`,
				})
			else
				warnings.value = warnings.value.filter(
					(warning) => warning.student !== student._id,
				)
		}
	}
}

async function uploadAssistance() {
	try {
		await $assistanceService.uploadAssistance(
			newAssistance.value.assistance.filter((ass) => ass.exists),
			idSection,
			newAssistance.value.date,
		)

		newAssistance.value = {
			date: '',
			assistance: [],
		}
		toastsStore.addToast({
			message: 'Se ha subido la asistencia exitosamente',
			type: 'error',
		})
	} catch (err) {
		toastsStore.addToast({
			message: `No se ha podido subir la asistencia`,
			type: 'error',
		})
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
						:click="() => (modalAdd = true)"
						title="Agregar asistencia"
						class-item="fa-solid fa-plus"
					/>
				</Icons>
			</template>

			<h2>Asistencias {{ fullCourseName }}</h2>
			<br />
			<HTMLTable
				v-if="assistances"
				:header="['Fecha', 'Bloque', 'Ver asistencia', 'Auditor']"
				:navigate="{
					activate: true,
					max: 10,
					async fn(page) {
						await getAssistances({
							skip: page * 10,
						})
					},
				}"
			>
				<tr
					v-for="(assistance, i) in assistances"
					:key="assistance._id"
				>
					<td>{{ formatDateLL(assistance.date) }}</td>
					<td>
						({{ assistance.block.number }})
						{{ assistance.block.hour_start }} -
						{{ assistance.block.hour_finish }}
					</td>
					<td>
						<HTMLButtonIcon
							class-item="fa-solid fa-eye"
							:click="
								() => {
									indexAss = i
									copyAssistance = assistance.assistance.map(
										(ass) => ({
											student: ass.student._id,
											assist: ass.assist,
										}),
									)
									modalAsssistance = true
									warnings = []
								}
							"
						/>
					</td>
					<td>
						({{ formatUserType(assistance.auditor.user_type) }})
						{{ assistance.auditor.name }}
						{{ assistance.auditor.first_lastname }}
					</td>
				</tr>
			</HTMLTable>

			<!-- Modals -->
			<Modal v-model:opened="modalAsssistance">
				<template v-if="assistances" #title>
					<h2>
						Asistencia
						{{ formatDateLL(assistances[indexAss].date) }}
					</h2>
				</template>
				<!-- Assistance day -->
				<Assistance
					v-if="assistances && copyAssistance"
					:assistance="copyAssistance"
					:students="
						assistances[indexAss].assistance.map(
							(ass) => ass.student,
						)
					"
					:id-section="idSection"
					:full-course-name="fullCourseName"
					:auditor="assistances[indexAss].auditor"
					:is-signed="assistances[indexAss].isSigned"
					@update:assistance="updateAssistance"
					@update:auditor="
						(auditor) => ((assistances as Array<AssistanceType>)[indexAss].auditor = auditor)
					"
				/>
			</Modal>

			<Modal v-model:opened="modalAdd">
				<template #title>
					<h2>Añadir asistencia</h2>
				</template>
				<HTMLForm :form="uploadAssistance">
					<label for="date">Fecha</label>
					<HTMLInput
						id="date"
						v-model:value="newAssistance.date"
						type="date"
					/>
					<label for="assistance">Asistencia</label>
					<Assistance
						v-if="students"
						id="assistance"
						v-model:assistance="newAssistance.assistance"
						:students="students"
						:upload="false"
						:editable="true"
						:is-signed="true"
						:func-editable="removeStudent"
					/>
					<footer class="Assitance__footer">
						<HTMLButtonIcon
							:click="
								() => {
									modalStudents = true
									modalAdd = false
								}
							"
							class-item="fa-solid fa-user-plus"
						>
							Añadir estudiante fuera del curso
						</HTMLButtonIcon>

						<br />
						<h4 v-if="warnings.length > 0">
							<i class="fa-solid fa-triangle-exclamation"></i>
							¡Advertencias!
						</h4>
						<div class="Assistance__warnings">
							<small v-for="(warning, i) in warnings" :key="i">
								<strong>
									{{ warning.warning }}
								</strong>
							</small>
						</div>
					</footer>

					<SpinnerGet scope="course:students" />
					<HTMLButton type="submit"> Añadir asistencia </HTMLButton>
				</HTMLForm>
			</Modal>

			<Modal
				v-model:opened="modalStudents"
				:fn="
					() => {
						ignore = true
						modalAdd = true
					}
				"
			>
				<template #title>
					<h2>Estudiantes</h2>
				</template>
				<SearchStudents
					class-item="fa-solid fa-user-plus"
					text="Añadir estudiante"
					:button="{
						isLink: false,
						func: addStudent,
					}"
					:filter="students?.map((student) => student._id)"
				/>
			</Modal>
			<!-- Error -->
			<Error v-if="error" :err="error" />
			<!-- Loading -->
			<SpinnerGet />
		</AdminPanel>
	</NuxtLayout>
</template>

<style lang="scss">
.Assitance__footer button {
	i,
	.Text {
		font-size: 0.8rem !important;
	}
}

.Assistance__warnings {
	display: flex;
	flex-direction: column;
}
</style>
