<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Course, Section } from '~~/models/course/course.model'
import type { Teacher } from '~~/models/user/teacher.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Secciones - Admin - ${schoolName} - Intranet`
	: 'Secciones - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $teacherService, $courseService, $fetchModule, $collegeService } =
	useNuxtApp()
// Route
const route = useRoute()

const courseId = route.params.course
if (typeof courseId !== 'string')
	throw createError({
		message: '[course] must be a string',
		statusCode: 400,
		fatal: true,
	})

// Modals
const modal = ref(false)
const modalSections = ref(false)
// Selected
const sectionSelected = ref<Section | null>(null)
// Forms
const section = ref('')
const tec = ref('')
const files = ref<FileList | null>(null)
const filesInput = [] as Array<HTMLInputElement>

// Data
const teachers = ref<Array<Teacher> | null>(null)
const sections = ref<Array<Section> | null>(null)
const tecs = ref<Array<string> | null>(null)
const course = ref<Course | null>(null)
const nextCourse = ref<Course | null>(null)
const nextSections = ref<Array<Section> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$teacherService.getTeachers(false, 0),
			$courseService.getSectionsCourse(courseId),
			$courseService.getCourse(courseId),
		]).then(async (data) => {
			const objectData = {
				teachers: data[0].users,
				sections: data[1],
				course: data[2],
				tec: data[2].isTec
					? await $collegeService.getRegisteredTec(data[2]._id)
					: null,
			}

			return objectData
		})

		filesInput.length = dataFetch.sections.length
		// Asign
		teachers.value = dataFetch.teachers
		sections.value = dataFetch.sections
		course.value = dataFetch.course
		tecs.value = dataFetch.tec
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})
// Sections
const errorNS = ref<ErrorFetch | null>(null)
async function getSectionsNextLevel() {
	try {
		// Clean error
		errorNS.value = null
		// Datafetch
		const dataFetch = await $courseService.getSectionsNextLevel(
			typeof courseId === 'string' ? courseId : '',
		)

		nextCourse.value = dataFetch.course
		nextSections.value = dataFetch.sections
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		errorNS.value = _err
	}
}

async function newSection() {
	const sectionData = await $courseService.newSection(
		section.value,
		files.value ?? null,
		typeof courseId === 'string' ? courseId : '',
		tec.value,
	)
	if (sectionData !== undefined && sections.value) {
		// New values
		section.value = ''
		sections.value = [sectionData, ...sections.value]
	}
}

async function addTeacher(idTeacher: string, idSection: string, index: number) {
	const changedTeacher = await $courseService.addTeacher(idTeacher, idSection)
	if (changedTeacher && idTeacher !== '' && sections.value)
		sections.value[index].header_teacher = idTeacher
}

async function deleteSection(id: string) {
	const isSectionDeleted = await $courseService.deleteSection(id)
	if (isSectionDeleted && sections.value)
		// Delete
		sections.value = sections.value.filter((section) => section._id !== id)
}

async function changeFile(sectionId: string, index: number) {
	const changedFile = await $courseService.changeFile(
		sectionId,
		filesInput[index].files,
	)
	if (changedFile && sections.value)
		sections.value[index].file.url = changedFile
}

async function selectNextSection(sectionData: Section | null = null) {
	const isSelected = await $courseService.selectNextSection(
		sectionSelected.value?._id ?? '',
		sectionData ? sectionData._id : undefined,
	)
	if (isSelected && sections.value) {
		sections.value = sections.value.map((section) => {
			if (section._id === sectionSelected.value?._id) {
				if (sectionData)
					return {
						...section,
						next_section: sectionData,
						is_next_section_variable: false,
					}
				return {
					...section,
					next_section: undefined,
					is_next_section_variable: true,
				}
			}
			return section
		})
		modalSections.value = false
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
						:click="() => (modal = true)"
						title="Agregar curso"
						class-item="fa-solid fa-plus"
					/>
				</Icons>
			</template>
			<h2>
				Secciones
				<span v-if="course">
					{{ course.course }}
					{{ course.isFinal ? '(Curso final)' : '' }}
				</span>
			</h2>
			<br />
			<!-- Data -->
			<HTMLTable
				v-if="sections"
				:header="[
					'Sección',
					'Imágen',
					'Sección sub-siguiente',
					'Especialidad',
					'Profesor jefe',
					'',
				]"
			>
				<tr v-for="(section, i) in sections" :key="section._id">
					<td>{{ section.section }}</td>
					<td>
						<input
							:ref="(el) => {
                                if (el) filesInput[i] = el as HTMLInputElement
                            }"
							type="file"
							class="file"
							accept=".jpg, .jpeg, .png"
							@change="() => changeFile(section._id, i)"
						/>
						<NuxtImg
							:src="section.file.url"
							:alt="section.section"
							@click="filesInput[i].click()"
							@error="$event.target.src = '/img/no_image.svg'"
						/>
					</td>
					<td>
						<div v-if="!course?.isFinal" class="Next">
							<span>
								{{
									section.is_next_section_variable
										? 'Variable'
										: section?.next_section
										? `${section.next_section.section}`
										: 'Sin asignar'
								}}
							</span>
							<div>
								<HTMLButtonIcon
									:click="
										() => {
											sectionSelected = section
											getSectionsNextLevel()
											modalSections = true
										}
									"
									class-item="fa-solid fa-arrows-turn-to-dots"
								/>
							</div>
						</div>
						<span v-else>No aplica</span>
					</td>
					<td>
						<span v-if="section.tec">{{ section.tec }}</span>
						<span v-else>No aplica</span>
					</td>
					<td>
						<HTMLSelect
							id="teacher"
							v-model:value="section.header_teacher"
							:change="() => addTeacher(section?.header_teacher as string ?? '', section._id, i)"
						>
							<option value="">Sin asignar</option>
							<option
								v-for="teacher in teachers"
								:key="teacher._id"
								:value="teacher._id"
							>
								{{ teacher.user.name }}
								{{ teacher.user.first_lastname }}
							</option>
						</HTMLSelect>
					</td>
					<td>
						<HTMLButtonIcon
							title="Eliminar sección"
							:click="
								() => {
									deleteSection(section._id)
								}
							"
							class-item="fa-solid fa-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="sections && sections.length === 0"
				>No hay secciones</span
			>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Agregar secci&oacute;n</h2>
			</template>
			<HTMLForm :form="newSection">
				<label for="section">Nombre secci&oacute;n</label>
				<HTMLInput id="section" v-model:value="section" />
				<template v-if="course?.isTec">
					<label for="tec">Carrera T&eacute;cnica</label>
					<HTMLSelect id="tec" v-model:value="tec">
						<option value="">
							Seleccione una carrera t&eacute;cnica
						</option>
						<option v-for="(tec, i) in tecs" :key="i" :value="tec">
							{{ tec }}
						</option>
					</HTMLSelect>
				</template>
				<label for="file">Im&aacute;gen</label>
				<HTMLInputFiles
					id="file"
					v-model:files="files"
					:filter="{
						filter: true,
						type: 'image',
						message: 'Debe seleccionar una imagen',
					}"
					accept=".jpg, .jpeg, .png"
				/>
				<HTMLButton type="submit">Agregar secci&oacute;n</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalSections">
			<template #title>
				<h2>Secciones sub-siguientes</h2>
			</template>
			<section v-if="nextSections && nextCourse">
				<h3>Curso {{ nextCourse.course }} ({{ nextCourse.level }}°)</h3>
				<br />
				<HTMLTable :header="['Sección', 'Seleccionar como siguiente']">
					<tr v-for="(section, i) in nextSections" :key="i">
						<td>
							{{ section.section }}
						</td>
						<td>
							<HTMLButtonIcon
								:selected="
									sectionSelected?.next_section?._id ===
									section._id
								"
								:click="() => selectNextSection(section)"
								class-item="fa-solid fa-circle-check"
							/>
						</td>
					</tr>
					<tr>
						<td>Variable</td>
						<td>
							<HTMLButtonIcon
								:selected="
									sectionSelected?.is_next_section_variable
								"
								:click="() => selectNextSection()"
								class-item="fa-solid fa-circle-check"
							/>
						</td>
					</tr>
				</HTMLTable>
			</section>

			<SpinnerGet />
			<Error v-if="errorNS" :err="errorNS" />
		</Modal>
	</NuxtLayout>
</template>

<style scoped>
img {
	width: 100px;
	height: 80px;
	object-fit: cover;
	border: 2px solid var(--color-light);
	cursor: pointer;
}

.file {
	display: none;
}

.Next {
	display: flex;
	gap: 15px;
	justify-content: center;
}

@media (max-width: 575.98px) {
	img {
		width: 90px;
		height: 60px;
	}
}
</style>
