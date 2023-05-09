<script setup lang="ts">
// Types
import { Subject } from '~/models/subject/subject.model'
import { ErrorFetch } from '~~/common/fetchModule'
import type { Course, Section } from '~~/models/course/course.model'
import type { Teacher, Teachers } from '~~/models/user/teacher.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Profesores - Admin - ${schoolName} - Intranet`
	: 'Profesores - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $fetchModule, $teacherService, $courseService } = useNuxtApp()

// Search
const search = ref('')

// Modal
const modal = ref(false)
const modalSubjects = ref(false)
const modalEdit = ref(false)
const modalStatus = ref(false)

// Form
const formTeacher = reactive({
	name: '',
	first_lastname: '',
	second_lastname: '',
	rut: '',
})
const subject = ref('')
// Change status
const why = ref('')

// Data
const teachers = ref<Teachers | null>(null)
const courses = ref<Array<Course> | null>(null)

const error = ref<ErrorFetch | null>(null)
// Provide total for nav
const total = ref(0)
provide('total', total)
onMounted(async () => {
	try {
		const data = await Promise.all([
			getTeachers(true),
			$courseService.getCourses(),
		])

		courses.value = data[1]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

async function getTeachers(getTotal = false, skip?: number, search?: string) {
	try {
		const dataFetch = await $teacherService.getTeachers(
			getTotal,
			skip,
			search,
		)

		if (getTotal || !teachers.value) {
			total.value = dataFetch.total ?? 0
			teachers.value = dataFetch
		} else teachers.value.users = dataFetch.users
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}

// Form edit
const teacherEdit = ref<Teacher | null>(null)
const teacherPosition = ref(0)

// Upload teacher
function initForm(newTeacher: Teacher) {
	modal.value = false
	formTeacher.name = ''
	formTeacher.first_lastname = ''
	formTeacher.second_lastname = ''
	formTeacher.rut = ''

	if (teachers.value)
		teachers.value.users = [newTeacher, ...teachers.value.users]
}

async function uploadTeacher() {
	const dataFetch = await $teacherService.uploadTeacher(formTeacher)
	if (dataFetch) initForm(dataFetch)
}

async function editTeacher() {
	if (!teacherEdit.value) return
	const index = teacherPosition.value
	const dataFetch = await $teacherService.editTeacher(teacherEdit.value)
	if (dataFetch && teachers.value) {
		modalEdit.value = false
		teachers.value.users[index] = teacherEdit.value
	}
}
// Add subject course
async function addSubjectCourse() {
	if (!teachers.value) return
	const id = teachers.value.users[teacherPosition.value]._id
	const dataFetch = await $teacherService.addSubjectCourse(subject.value, id)
	if (dataFetch && teachers.value)
		teachers.value.users[teacherPosition.value] = dataFetch
}

async function deleteSubjectCourse(idImparted: string) {
	if (!teachers.value) return
	const id = teachers.value.users[teacherPosition.value]._id
	const dataFetch = await $teacherService.deleteSubjectCourse(idImparted, id)
	if (dataFetch) {
		teachers.value.users[teacherPosition.value].imparted =
			teachers.value.users[teacherPosition.value].imparted.filter(
				(im) => im._id !== idImparted,
			)
	}
}
// Change status
function initStatusForm() {
	why.value = ''
	modalStatus.value = false
}

async function changeStatus() {
	const index = teacherPosition.value
	const dataFetch = await $teacherService.changeStatus(
		why.value,
		teacherEdit.value?.user._id ?? '',
	)
	if (dataFetch && teachers.value) {
		initStatusForm()
		teachers.value.users[index].user.status =
			teachers.value.users[index].user.status === 1 ? 0 : 1
	}
}

// Get subjects in sections
function getSubjectsInSections(courses: Array<Course>) {
	const sectionsWSubjects = courses.flatMap((course) => {
		return course.sections.map((section) => ({
			course,
			section,
			subjects: course.subjects,
		}))
	})
	return sectionsWSubjects.flatMap((sectionWSubjects) => {
		return sectionWSubjects.subjects.flatMap((subject) => ({
			course: sectionWSubjects.course,
			subject,
			section: sectionWSubjects.section,
		}))
	})
}

function filterTeacherImparted(
	css: Array<{
		course: Course
		subject: Subject
		section: Section
	}>,
) {
	const teacher = teachers.value?.users[teacherPosition.value]
	if (!teacher) return css
	return css.filter(
		(css) =>
			!teacher.imparted.some(
				(cssImparted) =>
					cssImparted.course._id === css.section._id &&
					cssImparted.subject._id === css.subject._id,
			),
	)
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
						title="Agregar profesor"
						:click="() => (modal = true)"
						class-item="fa-solid fa-user-plus"
					/>
					<HTMLAIcon
						title="Agregar profesores"
						href="/admin/profesores/masivo"
						class-item="fa-solid fa-user-group"
					/>
				</Icons>
			</template>
			<h2>Profesores</h2>
			<HTMLSearch
				v-model:value="search"
				:search="() => getTeachers(true, 0, search)"
			/>
			<br />
			<!-- Data -->
			<HTMLTable
				v-if="teachers"
				:header="[
					'Nombre',
					'Ap. P',
					'Ap. M',
					'RUT',
					'Estado',
					'Materias',
					'',
				]"
				:navigate="{
					activate: true,
					max: 30,
					fn(n) {
						getTeachers(false, n, search.value)
					},
				}"
			>
				<tr v-for="(teacher, i) in teachers.users" :key="i">
					<td>{{ teacher.user.name }}</td>
					<td>{{ teacher.user.first_lastname }}</td>
					<td>{{ teacher.user.second_lastname }}</td>
					<td>{{ teacher.user.rut }}</td>
					<td>{{ teacher.user.status ? 'Activo' : 'Inactivo' }}</td>
					<td>
						<HTMLButtonIcon
							type="button"
							:click="
								() => {
									modalSubjects = true
									teacherPosition = i
								}
							"
							class-item="fa-solid fa-book-bookmark"
						/>
					</td>
					<td>
						<HTMLButtonIcon
							:click="
								() => {
									teacherEdit = Object.assign({}, teacher)
									teacherPosition = i

									modalEdit = true
								}
							"
							type="button"
							class-item="fa-solid fa-pen-to-square"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="teachers && teachers.users.length === 0"
				>No hay profesores...</span
			>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Agregar profesor</h2>
			</template>
			<HTMLForm :form="uploadTeacher">
				<label for="name">Nombre</label>
				<HTMLInput id="name" v-model:value="formTeacher.name" />
				<label for="fln">Apellido Paterno</label>
				<HTMLInput
					id="fln"
					v-model:value="formTeacher.first_lastname"
				/>
				<label for="sln">Apellido Materno</label>
				<HTMLInput
					id="sln"
					v-model:value="formTeacher.second_lastname"
				/>
				<label for="rut">RUT</label>
				<HTMLInput id="rut" v-model:value="formTeacher.rut" />
				<HTMLButton type="submit">Agregar profesor</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalSubjects">
			<template #title>
				<h2 v-if="teachers">
					Materias {{ teachers.users[teacherPosition].user.name }}
					{{ teachers.users[teacherPosition].user.first_lastname }}
				</h2>
			</template>
			<HTMLForm :form="addSubjectCourse">
				<label for="subject">Materia - Curso</label>
				<HTMLSelect v-if="courses" id="subject" v-model:value="subject">
					<option value="">Seleccione una materia - curso</option>
					<option
						v-for="(css, i) in filterTeacherImparted(
							getSubjectsInSections(courses),
						)"
						:key="i"
						:value="`${css.section._id}-${css.subject._id}`"
					>
						{{ css.course.course }}
						{{ css.section.section }}
						{{ css.subject.subject }}
					</option>
				</HTMLSelect>
				<HTMLButton type="submit"
					>Agregar materia/curso al profesor</HTMLButton
				>
			</HTMLForm>
			<br />
			<HTMLTable v-if="teachers" :header="['Materia', 'Curso', '']">
				<tr
					v-for="(imparted, i) in teachers.users[teacherPosition]
						.imparted"
					:key="i"
				>
					<td>{{ imparted.subject.subject }}</td>
					<td>
						{{ imparted.course.course.course }}
						{{ imparted.course.section }}
					</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteSubjectCourse(imparted._id)"
							class-item="fa-solid fa-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
		</Modal>

		<Modal v-model:opened="modalEdit">
			<template #title>
				<h2 v-if="teachers">
					Editar {{ teachers.users[teacherPosition].user.name }}
					{{ teachers.users[teacherPosition].user.first_lastname }}
				</h2>
			</template>
			<HTMLForm v-if="teacherEdit" :form="editTeacher">
				<label for="nameE">Nombre</label>
				<HTMLInput id="nameE" v-model:value="teacherEdit.user.name" />
				<label for="flnE">Apellido Paterno</label>
				<HTMLInput
					id="flnE"
					v-model:value="teacherEdit.user.first_lastname"
				/>
				<label for="slnE">Apellido Materno</label>
				<HTMLInput
					id="slnE"
					v-model:value="teacherEdit.user.second_lastname"
				/>
				<label for="rutE">RUT</label>
				<HTMLInput id="rutE" v-model:value="teacherEdit.user.rut" />
				<HTMLButton type="submit">Editar profesor</HTMLButton>
			</HTMLForm>
			<button
				v-if="teachers?.users[teacherPosition].user.status === 1"
				class="Form__button Down"
				type="button"
				@click="() => (modalStatus = true)"
			>
				<i class="fa-solid fa-angles-down" /> Dar de baja profesor
			</button>
			<button
				v-else
				class="Form__button Up"
				type="button"
				@click="() => (modalStatus = true)"
			>
				<i class="fa-solid fa-angles-up" /> Reintegrar profesor
			</button>
		</Modal>

		<Modal v-model:opened="modalStatus">
			<template #title>
				<h2 v-if="teachers">
					Cambiar estado profesor -
					{{
						teachers.users[teacherPosition].user.status === 1
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
