<script setup lang="ts">
// Types
import type { Student } from '~~/models/user/student.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Estudiantes - Masivo - Admin - ${schoolName} - Intranet`
	: 'Estudiantes - Masivo - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $studentsService } = useNuxtApp()
// Router
const router = useRouter()

// Data
const students = ref<
	Array<Omit<Omit<Omit<Student, '_id'>, 'user_type'>, 'course'>>
>([
	{
		name: '',
		first_lastname: '',
		second_lastname: '',
		rut: '',
		registration_number: '',
	},
])
// Modal
const modal = ref(false)
// Cells
const cells = ref(0)

function deleteCell(position: number) {
	students.value.splice(position, 1)
}

function addCells() {
	for (let i = 0; i < cells.value; i++) {
		students.value.push({
			name: '',
			first_lastname: '',
			second_lastname: '',
			rut: '',
		})
	}
	cells.value = 0
	modal.value = false
}
// Upload data
async function uploadStudents() {
	const dataFetch = await $studentsService.uploadStudents(students.value)
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
		<AdminPanel>
			<template #nav>
				<Icons>
					<HTMLButtonIcon
						title="Agregar celdas"
						class-item="fa-solid fa-plus"
						:click="() => (modal = true)"
					/>
					<HTMLButtonIcon
						title="Subir estudiantes"
						class-item="fa-solid fa-arrow-up-from-bracket"
						:click="uploadStudents"
					/>
				</Icons>
			</template>
			<h2>Tabla estudiantes</h2>
			<br />
			<HTMLTable
				:header="['Nombre', 'Ap. P', 'Ap. M', 'RUT', 'Matricula', '']"
			>
				<tr v-for="(student, i) in students" :key="i">
					<td>
						<HTMLInput :id="`N${i}`" v-model:value="student.name" />
					</td>
					<td>
						<HTMLInput
							:id="`FL${i}`"
							v-model:value="student.first_lastname"
						/>
					</td>
					<td>
						<HTMLInput
							:id="`SL${i}`"
							v-model:value="student.second_lastname"
						/>
					</td>
					<td>
						<HTMLInput :id="`R${i}`" v-model:value="student.rut" />
					</td>
					<td>
						<HTMLInput
							:id="`RN${i}`"
							v-model:value="student.registration_number"
						/>
					</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteCell(i)"
							class-item="fa-solid fa-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Agregar celdas</h2>
			</template>
			<HTMLForm :form="addCells">
				<label for="cells">Cantidad de celdas</label>
				<HTMLInput id="cells" v-model:value="cells" type="number" />
				<HTMLButton type="submit">Agregar celdas</HTMLButton>
			</HTMLForm>
		</Modal>
	</NuxtLayout>
</template>
