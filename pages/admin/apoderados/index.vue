<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import type { Parent } from '~~/models/user/parent.model'
import type { User } from '~~/models/user/user.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Apoderados - Admin - ${schoolName} - Intranet`
	: 'Apoderados - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR],
})
// Nuxt app
const { $fetchModule, $parentService } = useNuxtApp()

// Search
const search = ref('')
// Modal
const modal = ref(false)
const modalEdit = ref(false)
const modalStatus = ref(false)
const modalStudents = ref(false)
const toggleModalStatus = () => {
	modalStatus.value = !modalStatus.value
	modalEdit.value = false
}
// Form
const formParent = reactive({
	name: '',
	first_lastname: '',
	second_lastname: '',
	rut: '',
})
// Change status
const why = ref('')
// Data
const parents = ref<Array<Parent> | null>(null)
const students = ref<Array<User> | null>(null)
const parentEdit = ref<User | null>(null)
const parentPosition = ref(0)
const idParent = ref('')

const error = ref<ErrorFetch | null>(null)
// Provide
const total = ref(0)
provide('total', total)
onMounted(() => {
	getParents(true, 0)
})

async function getParents(getTotal = false, skip?: number, search?: string) {
	try {
		// Clean error
		error.value = null
		// Get data
		const dataFetch = await $parentService.getParents(
			getTotal,
			skip,
			search,
		)
		if (getTotal || !parents.value) {
			parents.value = dataFetch.parents
			total.value = dataFetch.total ?? 0
		} else parents.value = dataFetch.parents
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}
// Upload parent
function initForm(newParent: Parent) {
	modal.value = false
	formParent.first_lastname = ''
	formParent.name = ''
	formParent.rut = ''
	formParent.second_lastname = ''

	parents.value?.push(newParent)
}

async function uploadParent() {
	const dataFetch = await $parentService.uploadParent(formParent as User)
	if (dataFetch !== undefined) initForm(dataFetch)
}

async function editParent() {
	const index = parentPosition.value
	const dataFetch = await $parentService.editParent(
		parentEdit.value as User,
		(parentEdit.value as User)._id,
	)
	if (dataFetch && parents.value) {
		modalEdit.value = false
		parents.value[index] = parentEdit.value as Parent
	}
}
// Change status
function initStatusForm() {
	why.value = ''
	toggleModalStatus()
}

async function changeStatus() {
	const index = parentPosition.value
	const dataFetch = await $parentService.changeStatus(
		why.value,
		(parentEdit.value as User)._id,
	)
	if (dataFetch && parents.value) {
		initStatusForm()
		parents.value[index].status = parents.value[index].status === 1 ? 0 : 1
	}
}
// Parent Students
async function getParentStudents(idParent: string) {
	students.value = null
	// Get students
	students.value = await $parentService.getParentStudentsByID(idParent)
}

async function assignStudent(idStudent: string) {
	const student = await $parentService.assignStudent(
		idParent.value,
		idStudent,
	)
	if (student) students.value?.push(student)
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
						title="Agregar apoderado"
						:click="() => (modal = true)"
						class-item="fa-solid fa-user-plus"
					/>
					<HTMLAIcon
						title="Agregar apoderados"
						href="/admin/apoderados/masivo"
						class-item="fa-solid fa-user-group"
					/>
				</Icons>
			</template>
			<h2>Apoderados</h2>
			<HTMLSearch
				v-model:value="search"
				:search="() => getParents(true, 0, search)"
			/>
			<br />
			<HTMLTable
				v-if="parents"
				:header="[
					'Nombre',
					'Ap. P',
					'Ap. M',
					'RUT',
					'Estudiantes',
					'Estado',
					'',
				]"
				:navigate="{
                    activate: true,
                    max: 30,
                    async fn(n: number) {
                        await getParents(true, n, search.value)
                    },
                }"
				@memo="(value: any) => {
                    if (parents) parents = value
                }"
			>
				<tr v-for="(parent, i) in parents" :key="parent._id">
					<td>{{ parent.name }}</td>
					<td>{{ parent.first_lastname }}</td>
					<td>{{ parent.second_lastname }}</td>
					<td>{{ parent.rut }}</td>
					<td>
						<HTMLButtonIcon
							:click="
								() => {
									idParent = parent._id
									modalStudents = true
									getParentStudents(parent._id)
								}
							"
							type="button"
							class-item="fa-solid fa-graduation-cap"
						/>
					</td>
					<td>{{ parent.status ? 'Activo' : 'Inactivo ' }}</td>
					<td>
						<HTMLButtonIcon
							:click="
								() => {
									parentEdit = Object.assign({}, parent)
									parentPosition = i

									modalEdit = true
								}
							"
							type="button"
							class-item="fa-solid fa-pen-to-square"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="parents && parents.length === 0">
				No hay apoderados...
			</span>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Agregar apoderado</h2>
			</template>
			<HTMLForm :form="uploadParent">
				<label for="name">Nombre</label>
				<HTMLInput id="name" v-model:value="formParent.name" />
				<label for="fln">Apellido Paterno</label>
				<HTMLInput id="fln" v-model:value="formParent.first_lastname" />
				<label for="sln">Apellido Materno</label>
				<HTMLInput
					id="sln"
					v-model:value="formParent.second_lastname"
				/>
				<label for="rut">RUT</label>
				<HTMLInput id="rut" v-model:value="formParent.rut" />
				<HTMLButton type="submit">Agregar apoderado</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalEdit">
			<template #title>
				<h2 v-if="parents">
					Editar {{ parents[parentPosition].name }}
					{{ parents[parentPosition].first_lastname }}
				</h2>
			</template>
			<HTMLForm v-if="parentEdit" :form="editParent">
				<label for="nameE">Nombre</label>
				<HTMLInput id="nameE" v-model:value="parentEdit.name" />
				<label for="flnE">Apellido Paterno</label>
				<HTMLInput
					id="flnE"
					v-model:value="parentEdit.first_lastname"
				/>
				<label for="slnE">Apellido Materno</label>
				<HTMLInput
					id="slnE"
					v-model:value="parentEdit.second_lastname"
				/>
				<label for="rutE">RUT</label>
				<HTMLInput id="rutE" v-model:value="parentEdit.rut" />
				<HTMLButton type="submit">Editar apoderado</HTMLButton>
			</HTMLForm>
			<button
				v-if="parents && parents[parentPosition].status === 1"
				class="Form__button Down"
				type="button"
				@click="toggleModalStatus"
			>
				<i class="fa-solid fa-angles-down" /> Dar de baja apoderado
			</button>
			<button
				v-else
				class="Form__button Up"
				type="button"
				@click="toggleModalStatus"
			>
				<i class="fa-solid fa-angles-up" /> Reintegrar apoderado
			</button>
		</Modal>

		<Modal v-model:opened="modalStatus" :fn="() => (modalEdit = true)">
			<template #title>
				<h2 v-if="parents">
					Cambiar estado apoderado -
					{{
						parents[parentPosition].status === 1
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

		<Modal v-model:opened="modalStudents">
			<template #title>
				<h2>Estudiantes asignados</h2>
			</template>
			<HTMLTable
				v-if="students?.length ?? 0 > 0"
				:header="['Nombre', 'RUT']"
			>
				<tr v-for="student in students" :key="student._id">
					<td>{{ student.name }} {{ student.first_lastname }}</td>
					<td>{{ student.rut }}</td>
				</tr>
			</HTMLTable>
			<span v-else>Sin estudiantes asignados...</span>

			<br />
			<h3>Asignar un alumno</h3>
			<br />
			<SearchStudents
				:button="{
					isLink: false,
					func: assignStudent,
				}"
				text="Asignar"
				class-item="fa-solid fa-user-plus"
			/>

			<SpinnerGet scope="parent_students" />
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
