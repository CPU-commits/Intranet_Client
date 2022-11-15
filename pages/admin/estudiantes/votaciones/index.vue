<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Student, Students } from '~~/models/user/student.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Votaciones - Estudiantes - Admin - ${schoolName} - Intranet`
	: 'Votaciones - Estudiantes - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $studentsService, $fetchModule } = useNuxtApp()
// Stores
const toasts = useToastsStore()
// Router
const router = useRouter()

const search = ref('')
const listIndex = ref(0)
// Modal
const modalMember = ref(false)
// Form
const votingForm = reactive({
	start_date: '',
	finish_date: '',
	period: '9',
	lists: [] as Array<{
		list_name: string
		students: Array<{
			_id: string
			student: string
			rol: string
		}>
	}>,
})
// Data
const students = ref<Students | null>(null)

const error = ref<ErrorFetch | null>(null)
// Provide total for navigate
const total = ref(0)
provide('total', total)
async function searchFunction(n = 0, getTotal = true) {
	try {
		const dataFetch = await $studentsService.getStudents(
			true,
			n,
			search.value,
			getTotal,
		)
		students.value = dataFetch
		if (getTotal) total.value = dataFetch.total ?? 0
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}
// Functions
function addList() {
	votingForm.lists = [
		...votingForm.lists,
		{
			list_name: '',
			students: [],
		},
	]
}

function addMember(student: Student) {
	const listMembers = votingForm.lists[listIndex.value].students
	if (
		!votingForm.lists.some((l) =>
			l.students.some((m) => m._id === student._id),
		)
	) {
		const studentName = `${student.name} ${student.first_lastname} ${student.second_lastname}`
		votingForm.lists[listIndex.value].students = [
			...listMembers,
			{
				_id: student._id,
				student: studentName,
				rol: '',
			},
		]
	} else {
		toasts.addToast({
			message: 'Este alumno ya está en alguna lista',
			type: 'error',
		})
	}
}

async function uploadVoting() {
	const data = {
		...votingForm,
		lists: votingForm.lists.map((list) => {
			return {
				...list,
				students: list.students.map((student) => {
					return {
						...student,
						student: undefined,
					}
				}),
			}
		}),
	}
	const dataFetch = await $studentsService.uploadVoting(data)
	if (dataFetch) router.push('/admin/estudiantes')
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
		<AdminPanel :nav="false">
			<h2>Votaciones</h2>
			<HTMLForm :form="uploadVoting">
				<h3>
					<i class="fa-solid fa-rectangle-list" /> Listas de
					estudiantes
				</h3>
				<article
					v-for="(list, i) in votingForm.lists"
					:key="i"
					class="List"
				>
					<header class="List__header">
						<span>{{ i + 1 }})</span>
						<HTMLInput
							v-model:value="list.list_name"
							placeholder="Nombre de la lista"
						/>
						<HTMLButtonIcon
							class-item="fa-solid fa-minus"
							title="Eliminar lista"
							:click="
								() => {
									votingForm.lists.splice(i, 1)
								}
							"
							:one-hundred="false"
						/>
					</header>
					<h4>
						<i class="fa-solid fa-people-group" />
						Miembros
						<HTMLButtonIcon
							class-item="fa-solid fa-circle-plus"
							:click="
								() => {
									modalMember = true
									listIndex = i
								}
							"
							title="Añadir miembro"
							:one-hundred="false"
						/>
					</h4>
					<br />
					<HTMLTable :header="['Estudiante', 'Rol', '']">
						<tr v-for="(student, j) in list.students" :key="j">
							<td>{{ student.student }}</td>
							<td>
								<HTMLInput v-model:value="student.rol" />
							</td>
							<td>
								<HTMLButtonIcon
									title="Eliminar miembro"
									class-item="fa-solid fa-circle-minus"
									:click="
										() => {
											list.students.splice(j, 1)
										}
									"
								/>
							</td>
						</tr>
					</HTMLTable>
					<span v-if="list.students.length === 0">Sin miembros</span>
				</article>
				<HTMLButtonIcon
					class-item="fa-solid fa-plus"
					:click="addList"
					title="Añadir lista"
				/>
				<label for="start">Fecha comienzo votaciones</label>
				<HTMLInput
					id="start"
					v-model:value="votingForm.start_date"
					type="date"
				/>
				<label for="finish">Fecha termino votaciones</label>
				<HTMLInput
					id="finish"
					v-model:value="votingForm.finish_date"
					type="date"
				/>
				<label for="period">Periodo de direcci&oacute;n (Meses)</label>
				<HTMLInput
					id="period"
					v-model:value="votingForm.period"
					type="number"
				/>
				<HTMLButton type="submit">Empezar votaciones</HTMLButton>
			</HTMLForm>
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modalMember">
			<template #title>
				<h2>Añadir miembro</h2>
			</template>
			<HTMLSearch v-model:value="search" :search="searchFunction" />
			<br />
			<HTMLTable
				v-if="students"
				:header="['Nombre', 'RUT', '']"
				:navigate="{
					activate: true,
					max: 30,
					fn(n) {
						searchFunction(n, false)
					},
				}"
			>
				<tr v-for="student in students.users" :key="student._id">
					<td>
						{{ student.name }}
						{{ student.first_lastname }}
						{{ student.second_lastname }}
					</td>
					<td>{{ student.rut }}</td>
					<td>
						<HTMLButtonIcon
							class-item="fa-solid fa-square-plus"
							:click="() => addMember(student)"
							title="Seleccionar alumno"
						/>
					</td>
				</tr>
			</HTMLTable>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</Modal>
	</NuxtLayout>
</template>

<style scoped>
.List {
	padding: 15px;
}

.List__header {
	display: flex;
	gap: 5px;
	align-items: center;
}

h4 {
	margin-top: 10px;
	display: flex;
	gap: 5px;
	align-items: center;
}
</style>
