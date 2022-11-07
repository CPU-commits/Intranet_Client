<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import type { Semester } from '~~/models/semester/semester.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.DIRECTIVE,
    ],
})
// Nuxtapp
const {
	$semesterService,
	$fetchModule,
} = useNuxtApp()
// Composable
const spinner = useSpinner()

// Modal
const modalSemester = ref(false)
const modalEdit = ref(false)

// Form
const semesterForm = reactive({
    semester: '',
    year: '',
})

// Data
const semesters = ref<Array<Semester> | null>(null)
const positionSemester = ref(0)
const semesterData = ref<Semester | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await $semesterService.getSemesters()
        semesters.value = dataFetch
    } catch (err) {
        const _err = $fetchModule.handleError(err)
		error.value = _err
    }
})

// Functions
async function addSemester() {
	const insertedSemester = await $semesterService.addSemester(semesterForm)
	if (insertedSemester !== undefined && semesters.value) {
		modalSemester.value = false

		semesters.value = [insertedSemester, ...semesters.value]
	}
}

async function initSemester() {
	const index = positionSemester.value
	const init = await $semesterService.initSemester(
		semesters.value ? semesters.value[index]._id : '',
	)
	if (init && semesters.value)
		// Change status
		semesters.value[index].status = 2
}

async function updateSemester() {
	if (!semesterData.value) return
	const index = positionSemester.value
	const updatedSemester = await $semesterService.updateSemester(
		semesterData.value,
	)

	if (updatedSemester !== undefined && semesters.value)
		semesters.value[index] = updatedSemester
}
</script>

<template>
	<NuxtLayout name="admin">
		<AdminPanel>
			<template #nav>
				<Icons>
					<HTMLButtonIcon
						:click="() => modalSemester = true"
						title="Agregar semestre"
						classItem="fa-solid fa-plus"
					/>
					<HTMLAIcon
						href="/admin/semestres/finalizar_semestre"
						title="Finalizar semestre vigente"
						classItem="fa-solid fa-flag"
					/>
				</Icons>
			</template>
			<h2>Semestres</h2>
			<br />
			<!-- Data -->
			<HTMLTable
				v-if="semesters"
				:header="['Año', 'Semestre', 'Estado', 'Inicializar semestre', 'Editar']"
			>
				<tr v-for="(semester, i) in semesters" :key="semester._id">
					<td>{{ semester.year }}</td>
					<td>{{ semester.semester }}°</td>
					<td>
						{{ semester.status === 0
							? 'Finalizado'
							: semester.status === 1
							? 'En espera'
							: 'Vigente' }}
					</td>
					<td>
						<HTMLButton
							:click="() => {
								positionSemester = i
								initSemester()
							}"
							type="button"
						>
							<i class="fa-solid fa-rocket" />
						</HTMLButton>
					</td>
					<td>
						<HTMLButton
							:click="() => {
								modalEdit = true
								positionSemester = i
								semesterData = semester
								semesterData.semester = semesterData.semester.toString()
							}"
							type="button"
						>
							<i class="fa-solid fa-pen-to-square" />
						</HTMLButton>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="semesters && semesters.length === 0">No hay semestres...</span>
			
			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modalSemester">
			<template #title>
				<h2>Agregar semestre</h2>
			</template>
			<HTMLForm :form="addSemester">
				<label for="year">Año</label>
				<HTMLInput v-model:value="semesterForm.year" id="year" type="number" />
				<label for="semester">Semestre</label>
				<HTMLSelect v-model:value="semesterForm.semester" id="semester">
					<option value="">Seleccione un semestre</option>
					<option value="1">1°</option>
					<option value="2">2°</option>
				</HTMLSelect>
				<HTMLButton type="submit">Agregar semestre</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalEdit">
			<template #title>
				<h2 v-if="semesters">
					Editar semestre
					{{ semesters[positionSemester].semester }}° -
					{{ semesters[positionSemester].year }}
				</h2>
			</template>
			<HTMLForm v-if="semesterData" :form="updateSemester">
				<label for="year">Año</label>
				<HTMLInput v-model:value="semesterData.year" id="year" type="number" />
				<label for="semester">Semestre</label>
				<HTMLSelect v-model:value="semesterData.semester" id="semester">
					<option value="1">1°</option>
					<option value="2">2°</option>
				</HTMLSelect>
				<HTMLButton type="submit">Actualizar semestre</HTMLButton>
			</HTMLForm>
		</Modal>
	</NuxtLayout>
</template>

<style scoped>
	td i {
		color: white;
	}
</style>
