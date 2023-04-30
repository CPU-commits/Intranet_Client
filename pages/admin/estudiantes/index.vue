<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Section } from '~~/models/course/course.model'
import type { Student, Students } from '~~/models/user/student.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Estudiantes - Admin - ${schoolName} - Intranet`
	: 'Estudiantes - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $studentsService, $fetchModule, $courseService } = useNuxtApp()
// Composable
const votingStatus = useVoting()

// Search
const search = ref('')
// Modal
const modal = ref(false)
const modalEdit = ref(false)
const modalStatus = ref(false)
const toggleModalStatus = () => {
	modalStatus.value = !modalStatus.value
	modalEdit.value = false
}
// Form
const formStudent: Omit<
	Omit<Omit<Student, '_id'>, 'user_type'>,
	'course'
> = reactive({
	name: '',
	first_lastname: '',
	second_lastname: '',
	rut: '',
	registration_number: '',
})
const course = ref('')
// Change status
const why = ref('')
// Data
const students = ref<Students | null>(null)
const sections = ref<Array<Section> | null>(null)
const studentEdit = ref<Student | null>(null)
const studentPosition = ref(0)

const error = ref<ErrorFetch | null>(null)
// Provide total for navigate
const total = ref(0)
provide('total', total)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			getStudents(true, 0),
			$courseService.getSections(),
		])
		sections.value = dataFetch[1]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

async function getStudents(getTotal = false, skip?: number, search?: string) {
	try {
		// Clean error
		error.value = null
		// Get data
		const dataFetch = await $studentsService.getStudents(
			getTotal,
			skip,
			search,
		)

		if (getTotal || !students.value) {
			students.value = dataFetch
			total.value = dataFetch.total ?? 0
		} else students.value.users = dataFetch.users

		return dataFetch
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}
// Upload student
function initForm(newStudent: Student) {
	modal.value = false
	formStudent.name = ''
	formStudent.first_lastname = ''
	formStudent.registration_number = ''
	formStudent.rut = ''
	formStudent.second_lastname = ''
	if (students.value)
		students.value.users = [newStudent, ...students.value.users]
}

async function uploadStudent() {
	const dataFetch = await $studentsService.uploadStudent(formStudent)
	if (dataFetch !== undefined) {
		const registrationNumber = formStudent.registration_number
		initForm({ ...dataFetch, registration_number: registrationNumber })
	}
}

async function editStudent() {
	const index = studentPosition.value
	const dataFetch = await $studentsService.editStudent(
		studentEdit.value as Student,
		course.value,
	)
	if (dataFetch && students.value && studentEdit.value) {
		modalEdit.value = false
		let section: Section | undefined
		if (course.value !== '') {
			section = (sections.value as Array<Section>).filter(
				(section) => section._id === course.value,
			)[0]
		}
		students.value.users[index] = {
			...studentEdit.value,
			course: section as Section,
		}
	}
}
// Change status
function initStatusForm() {
	why.value = ''
	toggleModalStatus()
}

async function changeStatus() {
	const index = studentPosition.value
	const dataFetch = await $studentsService.changeStatus(
		why.value,
		(studentEdit.value as Student)._id,
	)
	if (dataFetch && students.value) {
		initStatusForm()
		students.value.users[index].status =
			students.value.users[index].status === 1 ? 0 : 1
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
						title="Agregar estudiante"
						:click="() => (modal = true)"
						class-item="fa-solid fa-user-plus"
					/>
					<HTMLAIcon
						title="Agregar estudiantes"
						href="/admin/estudiantes/masivo"
						class-item="fa-solid fa-user-group"
					/>
					<HTMLAIcon
						title="Iniciar votaciones estudiantiles"
						:href="
							votingStatus === 'opened'
								? '/admin/estudiantes/votaciones'
								: '/admin/estudiantes/votaciones/editar'
						"
						class-item="fa-solid fa-check-to-slot"
					/>
				</Icons>
			</template>
			<h2>Estudiantes</h2>
			<HTMLSearch
				v-model:value="search"
				:search="() => getStudents(true, 0, search)"
			/>
			<br />
			<HTMLButton type="button" :click="() => $courseService.getCycles()"
				>hola</HTMLButton
			>
			<!-- Data -->
			<HTMLTable
				v-if="students"
				:header="[
					'Nombre',
					'Ap. P',
					'Ap. M',
					'RUT',
					'Curso',
					'Matricula',
					'Estado',
					'',
				]"
				:navigate="{
					activate: true,
					max: 30,
					async fn(n) {
						getStudents(false, n, search.value)
					},
				}"
			>
				<tr v-for="(student, i) in students.users" :key="i">
					<td>{{ student.name }}</td>
					<td>{{ student.first_lastname }}</td>
					<td>{{ student.second_lastname }}</td>
					<td>{{ student.rut }}</td>
					<td>
						{{
							student.course
								? `${student.course.course.course} ${student.course.section}`
								: 'Sin curso'
						}}
					</td>
					<td>{{ student.registration_number }}</td>
					<td>{{ student.status ? 'Activo' : 'Inactivo' }}</td>
					<td>
						<HTMLButtonIcon
							:click="
								() => {
									studentEdit = Object.assign({}, student)
									studentPosition = i
									course = student?.course?._id
										? student.course._id
										: ''
									modalEdit = true
								}
							"
							type="button"
							class-item="fa-solid fa-pen-to-square"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="students && students.users.length === 0"
				>No hay alumnos...</span
			>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Agregar estudiante</h2>
			</template>
			<HTMLForm :form="uploadStudent">
				<label for="name">Nombre</label>
				<HTMLInput id="name" v-model:value="formStudent.name" />
				<label for="fln">Apellido Paterno</label>
				<HTMLInput
					id="fln"
					v-model:value="formStudent.first_lastname"
				/>
				<label for="sln">Apellido Materno</label>
				<HTMLInput
					id="sln"
					v-model:value="formStudent.second_lastname"
				/>
				<label for="rut">RUT</label>
				<HTMLInput id="rut" v-model:value="formStudent.rut" />
				<label for="registration_number">Matricula</label>
				<HTMLInput
					id="registration_number"
					v-model:value="formStudent.registration_number"
				/>
				<HTMLButton type="submit">Agregar estudiante</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalEdit">
			<template #title>
				<h2 v-if="students">
					Editar {{ students.users[studentPosition].name }}
					{{ students.users[studentPosition].first_lastname }}
				</h2>
			</template>
			<HTMLForm v-if="studentEdit" :form="editStudent">
				<label for="nameE">Nombre</label>
				<HTMLInput id="nameE" v-model:value="studentEdit.name" />
				<label for="flnE">Apellido Paterno</label>
				<HTMLInput
					id="flnE"
					v-model:value="studentEdit.first_lastname"
				/>
				<label for="slnE">Apellido Materno</label>
				<HTMLInput
					id="slnE"
					v-model:value="studentEdit.second_lastname"
				/>
				<label for="rutE">RUT</label>
				<HTMLInput id="rutE" v-model:value="studentEdit.rut" />
				<label for="course">Curso</label>
				<HTMLSelect id="course" v-model:value="course">
					<option value="">Sin curso</option>
					<option
						v-for="section in sections"
						:key="section._id"
						:value="section._id"
					>
						{{ section.course.course }}
						{{ section.section }}
					</option>
				</HTMLSelect>
				<label for="registration_numberE">Matricula</label>
				<HTMLInput
					id="registration_numberE"
					v-model:value="studentEdit.registration_number"
				/>
				<HTMLButton type="submit">Editar estudiante</HTMLButton>
			</HTMLForm>
			<button
				v-if="students?.users[studentPosition].status === 1"
				class="Form__button Down"
				type="button"
				@click="toggleModalStatus"
			>
				<i class="fa-solid fa-angles-down" /> Dar de baja estudiante
			</button>
			<button
				v-else
				class="Form__button Up"
				type="button"
				@click="toggleModalStatus"
			>
				<i class="fa-solid fa-angles-up" /> Reintegrar estudiante
			</button>
		</Modal>

		<Modal v-model:opened="modalStatus">
			<template #title>
				<h2 v-if="students">
					Cambiar estado directivo -
					{{
						students.users[studentPosition].status === 1
							? 'Dar de baja'
							: 'Reintegrar'
					}}
				</h2>
			</template>
			<HTMLForm :form="changeStatus">
				<label for="why">Motivo</label>
				<HTMLTextArea v-model:value="why" />
				<HTMLButton type="submit">Cambiar estado</HTMLButton>
			</HTMLForm>
		</Modal>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
h2 {
	margin-bottom: 15px;
}

i {
	color: white;
}

.Form__button {
	position: absolute;
	top: 75px;
	background: transparent;
	border: none;
}

.Down {
	color: var(--color-danger);
	i {
		color: var(--color-danger);
	}
}

.Up {
	color: var(--color-main);
	i {
		color: var(--color-main);
	}
}

@media (max-width: 575.98px) {
	.Form__button {
		top: 45px;
	}
}
</style>
