<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Course } from '~~/models/course/course.model'
import type { Cycle } from '~~/models/course/cycle.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Cursos - Admin - ${schoolName} - Intranet`
	: 'Cursos - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $fetchModule, $courseService, $collegeService } = useNuxtApp()

// Modal
const modalCycle = ref(false)
const modalCourse = ref(false)
const modalMap = ref(false)
const modalEdit = ref(false)

const toggleEdit = (i: number) => {
	positionCourse.value = i
	modalEdit.value = !modalEdit.value
}
// Forms
const cycle = ref('')
const courseForm = {
	key: '',
	course: '',
	cycle: '',
	level: 0,
}
// Dangers
const first = ref(false)
const consecutive = ref(false)
const final = ref(false)
// Edit
const positionCourse = ref(0)
const courseEdit = ref<Course | null>(null)
// Data
const courses = ref<Array<Course> | null>(null)
const cycles = ref<Array<Cycle> | null>(null)
const grades = ref<Array<{
	key: string
	level: string
	specialty: string | null
	value: string
}> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$courseService.getCourses(),
			$courseService.getCycles(),
			$collegeService.getRegisteredGrades(),
		])
		courses.value = dataFetch[0]
		cycles.value = dataFetch[1]
		grades.value = dataFetch[2]
		// Dangers init
		recalculateDangers()
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

// Functions
// Dangers
function findElementByLevel(level: number) {
	const element = courses.value?.filter((course) => course.level === level)
	return element ? element[0] ?? null : null
}

function isConsecutive() {
	if (courses.value && courses.value.length > 0) {
		let afterElement = courses.value[0]
		for (let i = 1; i < courses.value.length; i++) {
			const element = courses.value[i]
			if (element.level - 1 !== afterElement.level) return false
			afterElement = element
		}
	} else {
		return false
	}
	return true
}

function existsFinal() {
	return courses.value?.some((c) => c.isFinal)
}

function recalculateDangers() {
	first.value = !findElementByLevel(1)
	consecutive.value = !isConsecutive()
	final.value = !existsFinal()
}

// Cycles
async function newCycle() {
	const dataFetch = await $courseService.newCycle(cycle.value)
	if (dataFetch !== undefined) {
		cycle.value = ''
		cycles.value?.push(dataFetch)
	}
}

async function deleteCycle(idCycle: string, i: number) {
	const dataFetch = await $courseService.deleteCycle(cycle.value, idCycle)
	if (dataFetch) cycles.value?.splice(i, 1)
}

// Course
function initCourse() {
	courseForm.course = ''
	courseForm.cycle = ''
	courseForm.level = 0
}

async function newCourse() {
	const dataFetch = await $courseService.newCourse(courseForm)
	if (dataFetch !== undefined && courses.value) {
		initCourse()
		courses.value = [dataFetch, ...courses.value]
		modalCourse.value = false
		// Sort
		courses.value.sort((a, b) => {
			return a.level - b.level
		})
		// Dangers
		recalculateDangers()
	}
}

async function updateCourse() {
	const index = positionCourse.value
	if (courseEdit.value) {
		const dataFetch = await $courseService.updateCourse(
			courseEdit.value,
			courseEdit.value._id,
		)
		if (dataFetch !== undefined && courses.value) {
			modalEdit.value = false
			courses.value[index] = dataFetch
			// Dangers
			recalculateDangers()
		}
	}
}

async function deleteCourse(id: string) {
	const index = positionCourse.value
	const dataFetch = await $courseService.deleteCourse(id)
	if (dataFetch) {
		// Delete
		modalEdit.value = false
		courses.value?.splice(index, 1)
		// Dangers
		recalculateDangers()
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
						:click="() => (modalCourse = true)"
						title="Agregar curso"
						class-item="fa-solid fa-plus"
					/>
					<HTMLButtonIcon
						:click="() => (modalCycle = true)"
						title="Ciclos"
						class-item="fa-solid fa-network-wired"
					/>
					<HTMLButtonIcon
						:click="() => (modalMap = true)"
						title="Mapa de cursos"
						class-item="fa-solid fa-diagram-next"
					/>
				</Icons>
			</template>
			<h2>Cursos</h2>
			<br />
			<span v-if="courses && first" class="Danger">
				* No existe el primer grado
			</span>
			<span v-if="courses && consecutive" class="Danger">
				* No son consecutivos los niveles/grados
			</span>
			<span v-if="courses && final" class="Danger">
				* No existe final de nivel/grado
			</span>
			<!-- Data -->
			<HTMLTable
				v-if="courses"
				:header="[
					'Curso',
					'Ciclo',
					'Nivel/Grado',
					'Secciones',
					'Final',
					'',
				]"
			>
				<tr v-for="(course, i) in courses" :key="course._id">
					<td>{{ course.course }}</td>
					<td>{{ course.cycle.cycle }}</td>
					<td>{{ course.level }}°</td>
					<td>
						<HTMLAIcon
							:href="`/admin/secciones/${course._id}`"
							class-item="fa-solid fa-cubes"
						/>
					</td>
					<td>{{ course.isFinal ? 'Final' : 'No' }}</td>
					<td>
						<HTMLButtonIcon
							:click="
								() => {
									courseEdit = Object.assign({}, course)
									courseEdit.isFinal = courseEdit.isFinal
										? 'true'
										: 'false'
									toggleEdit(i)
								}
							"
							type="button"
							class-item="fa-solid fa-pen-to-square"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="courses && courses.length === 0"
				>No existen cursos...</span
			>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modalCycle">
			<template #title>
				<h2>Ciclos</h2>
			</template>
			<h3>Agregar ciclo</h3>
			<HTMLForm :form="newCycle">
				<label for="level">Ciclo</label>
				<HTMLInput id="level" v-model:value="cycle" />
				<HTMLButton type="submit">Agregar ciclo</HTMLButton>
			</HTMLForm>
			<br />
			<h3>Ciclos</h3>

			<HTMLTable :header="['Ciclo', '']">
				<!-- eslint-disable vue/no-template-shadow -->
				<tr v-for="(cycle, i) in cycles" :key="i">
					<td>{{ cycle.cycle }}</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteCycle(cycle._id, i)"
							class-item="fa-solid fa-minus"
							title="Eliminar ciclo"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="cycles && cycles.length === 0">No hay ciclos...</span>
		</Modal>

		<Modal v-model:opened="modalCourse">
			<template #title>
				<h2>Agregar curso</h2>
			</template>
			<HTMLForm :form="newCourse">
				<label for="course">Curso</label>
				<HTMLSelect
					id="course"
					value=""
					@update:value="(value: string) => {
						courseForm.key = value
						courseForm.course = value.split(':').at(1) ?? ''
					}"
				>
					<option value="">Selecciona un curso</option>
					<option
						v-for="(grade, i) in grades"
						:key="i"
						:value="grade.key"
					>
						{{ grade.value }}
						({{ grade.level.split(':').at(1) }})
					</option>
				</HTMLSelect>
				<label for="cycle">Ciclo</label>
				<HTMLSelect id="cycle" v-model:value="courseForm.cycle">
					<option value="">Seleccione un ciclo</option>
					<option
						v-for="cycle in cycles"
						:key="cycle._id"
						:value="cycle._id"
					>
						{{ cycle.cycle }}
					</option>
				</HTMLSelect>
				<label for="level">Nivel/Grado</label>
				<HTMLInput
					id="level"
					v-model:value="courseForm.level"
					type="number"
				/>
				<HTMLButton type="submit">Agregar curso</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalMap">
			<template #title>
				<h2>Mapa cursos (Nivel/Grados)</h2>
			</template>
			<section class="Map">
				<AdminMapElement
					v-for="(course, i) in courses"
					:key="course._id"
					:sections="course.sections"
					:course="course.course"
					:grade="course.level"
				>
					<i
						v-if="courses && i + 1 !== courses.length"
						class="fa-solid fa-arrow-down"
					/>
				</AdminMapElement>
			</section>
		</Modal>

		<Modal v-model:opened="modalEdit">
			<template #title>
				<h2 v-if="courses">
					Editar curso {{ courses[positionCourse].course }}
				</h2>
			</template>
			<HTMLForm v-if="courseEdit" :form="updateCourse">
				<label for="courseE">Curso</label>
				<HTMLInput id="courseE" v-model:value="courseEdit.course" />
				<label for="cycleE">Ciclo</label>
				<HTMLSelect id="cycleE" v-model:value="courseEdit.cycle._id">
					<option
						v-for="cycle in cycles"
						:key="cycle._id"
						:value="cycle._id"
					>
						{{ cycle.cycle }}
					</option>
				</HTMLSelect>
				<label for="levelE">Nivel/Grado</label>
				<HTMLInput
					id="levelE"
					v-model:value="courseEdit.level"
					type="number"
				/>
				<label for="final">Final</label>
				<HTMLSelect id="final" v-model:value="courseEdit.isFinal">
					<option value="false">No, no es final</option>
					<option value="true">Sí, es final</option>
				</HTMLSelect>
				<HTMLButton type="submit">Editar curso</HTMLButton>
				<button
					type="button"
					class="Form__button Down"
					@click="() => deleteCourse(courseEdit?._id ?? '')"
				>
					<i class="fa-solid fa-trash-can" /> Eliminar curso
				</button>
			</HTMLForm>
		</Modal>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
.Danger {
	color: var(--color-danger);
	margin-bottom: 20px;
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

.Map {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
}

.Map i {
	color: var(--color-main);
	font-size: 1.3rem;
}

h3 {
	margin-bottom: 10px;
}

@media (max-width: 575.98px) {
	h3 {
		font-size: 1rem;
	}

	.Map {
		gap: 10px;
		i {
			font-size: 1rem;
		}
	}
}
</style>
