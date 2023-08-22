<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Section } from '~~/models/course/course.model'
import type { Student } from '~~/models/user/student.model'
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
const { $studentsService, $fetchModule, $courseService, $filesService } =
	useNuxtApp()
// Route
const route = useRoute()

const idStudent = route.params.student as string
// Modal
const modalEdit = ref(false)
const modalStatus = ref(false)
const toggleModalStatus = () => {
	modalStatus.value = !modalStatus.value
	modalEdit.value = false
}
// Form
const files = ref<FileList | null>(null)
const course = ref('')
// Change status
const why = ref('')
// Data
const student = ref<Student | null>(null)
const registrationTypes = ref<Array<{ text: string; value: string }>>([])
const sections = ref<Array<Section> | null>(null)

const error = ref<ErrorFetch | null>(null)
// Provide total for navigate
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			getStudent(),
			$courseService.getSections(),
			$studentsService.getRegistrationTypes(),
		])

		if (dataFetch[0]) {
			student.value = dataFetch[0]
			course.value = dataFetch[0].course?._id
		}

		sections.value = dataFetch[1]
		registrationTypes.value = dataFetch[2]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

async function getStudent() {
	try {
		// Clean error
		error.value = null
		// Get data
		const dataFetch = await $studentsService.getStudent(idStudent)

		return dataFetch
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}

async function editStudent() {
	await $studentsService.editStudent(student.value as Student, course.value)
}

async function updateRegistration() {
	const idFile = await $studentsService.updateRegistration(
		idStudent as string,
		{
			type: student.value?.registration.registration_type ?? '',
			file: files.value ? files.value[0] : null,
		},
	)
	if (idFile && student.value) student.value.registration.file = idFile
}
// Change status
function initStatusForm() {
	why.value = ''
	toggleModalStatus()
}

async function changeStatus() {
	const dataFetch = await $studentsService.changeStatus(
		why.value,
		(student.value as Student)._id,
	)
	if (dataFetch && student.value) {
		initStatusForm()
		student.value.status = student.value.status === 1 ? 0 : 1
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
		<AdminPanel v-if="student" :nav="false">
			<h2>{{ student.name }} {{ student.first_lastname }}</h2>
			<!-- Data -->
			<h4>
				<i class="fa-solid fa-database"></i> Informaci&oacute;n
				estudiante
			</h4>
			<br />
			<!-- Info -->
			<HTMLForm v-if="student" :form="editStudent">
				<label for="nameE">Nombres</label>
				<HTMLInput id="nameE" v-model:value="student.name" />
				<label for="flnE">Apellido Paterno</label>
				<HTMLInput id="flnE" v-model:value="student.first_lastname" />
				<label for="slnE">Apellido Materno</label>
				<HTMLInput id="slnE" v-model:value="student.second_lastname" />
				<label for="rutE">RUT</label>
				<HTMLInput id="rutE" v-model:value="student.rut" />
				<label for="gender">Sexo</label>
				<HTMLSelect id="gender" v-model:value="student.gender">
					<option value="">Seleccione un sexo</option>
					<option value="h">Hombre</option>
					<option value="m">Mujer</option>
				</HTMLSelect>
				<label for="birthday">Fecha de nacimiento</label>
				<HTMLInput
					id="birthday"
					v-model:value="student.birthday"
					type="date"
				/>
				<template v-if="student.status === 1">
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
						v-model:value="student.registration_number"
					/>
					<label for="number_listE">N&uacute;mero de lista</label>
					<HTMLInput
						id="numer_listE"
						v-model:value="student.number_of_list"
					/>
				</template>
				<HTMLButton type="submit">Editar estudiante</HTMLButton>
			</HTMLForm>
			<br />
			<!-- State -->
			<template v-if="student.status === 1">
				<h4><i class="fa-solid fa-signal"></i> Estado estudiante</h4>
				<HTMLForm :form="updateRegistration">
					<label for="registration">Matr&iacute;cula</label>
					<HTMLSelect
						id="registration"
						v-model:value="student.registration.registration_type"
					>
						<option value="">
							Seleccione un tipo de matr&iacute;cula
						</option>
						<option
							v-for="(rType, i) in registrationTypes"
							:key="i"
							:value="rType.value"
						>
							{{ rType.text }}
						</option>
					</HTMLSelect>

					<label for="file"
						>Actualizar archivo matr&iacute;cula</label
					>
					<HTMLInputFiles id="file" v-model:files="files" />

					<div v-if="student.registration.file" class="Download">
						<h5>Descargar matr&iacute;cula</h5>
						<HTMLButtonIcon
							class-item="fa-solid fa-file-arrow-down"
							:one-hundred="false"
							:click="
								() =>
									$filesService.downloadFile(
										(student?.registration?.file) as string,
										true,
									)
							"
						/>
					</div>

					<HTMLButton type="submit">
						Cambiar estado estudiante
					</HTMLButton>
				</HTMLForm>
			</template>
			<strong v-else-if="student.status === 0">
				Estudiante retirado definitivamente
			</strong>
			<strong v-else-if="student.status === 2">
				Estudiante egresado
			</strong>
			<!-- Status -->
			<button
				v-if="student?.status === 1"
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

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modalStatus">
			<template #title>
				<h2>
					Cambiar estado estudiante -
					{{ student?.status === 1 ? 'Dar de baja' : 'Reintegrar' }}
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
	padding-top: 15px;
}

i {
	color: white;
}

.Form__button {
	position: absolute;
	top: 105px;
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

.Download {
	display: flex;
	gap: 10px;
}

@media (max-width: 575.98px) {
	.Form__button {
		top: 45px;
	}
}
</style>
