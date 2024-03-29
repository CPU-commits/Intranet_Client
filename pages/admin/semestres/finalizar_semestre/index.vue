<script setup lang="ts">
// Types
import type {
	FinishSemester,
	Semester,
} from '~~/models/semester/semester.model'
import type { Course, Section } from '~~/models/course/course.model'
import type { Student } from '~~/models/user/student.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { ErrorFetch } from '~~/common/fetchModule'
// Utils
import { formatDate } from '~~/utils/format'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Finalizar Semestre - Admin - ${schoolName} - Intranet`
	: 'Finalizar Semestre - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})

// Nuxtapp
const { $semesterService, $courseService, $fetchModule } = useNuxtApp()
// Router
const router = useRouter()
// Composable
const spinner = useSpinner()

// Before
const finishSemester = ref<FinishSemester | null>(null)
try {
	const dataFetch = await $semesterService.getFinishSemester()
	finishSemester.value = dataFetch
} catch (err) {
	const _err = $fetchModule.handleError(err)
	throw createError({
		..._err,
		fatal: true,
	})
}

// Data
const currentSemester = ref<Semester | null>(null)
const courses = ref<Array<Course> | null>(null)
const variableSections = ref<Array<Section> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$semesterService.getCurrentSemester(),
			$courseService.getCourses(),
			$courseService.getVariableSections(),
		])

		// Courses
		const coursesWithoutVariableSections = dataFetch[1].map((course) => {
			return {
				...course,
				sections: course.sections.filter(
					(section) => !section.is_next_section_variable,
				),
			}
		})
		students.value = new Array(coursesWithoutVariableSections.length)
		// Assign
		currentSemester.value = dataFetch[0]
		courses.value = coursesWithoutVariableSections
		variableSections.value = dataFetch[2]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

// Students data
const students = ref<{ student: Student; repeat: boolean }[][]>([])
const studentsVariable = ref<
	{
		student: Student
		id_next_section: string
	}[][]
>([])

async function getStudentsFromCourse(
	idCourse: string,
	index: number,
	isVariable = false,
) {
	try {
		if (!students.value[index] || !studentsVariable.value[index]) {
			const studentsData = await $courseService.getStudentsFromCourse(
				idCourse,
			)
			if (!isVariable) {
				students.value[index] = studentsData.map((student) => {
					return {
						student,
						repeat: false,
					}
				})
			} else {
				studentsVariable.value[index] = studentsData.map((student) => {
					return {
						student,
						id_next_section: '',
					}
				})
			}
		}
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}

function getNextSectionsCourse(courses: Course[], level: number): Section[] {
	let nextCourse: Course
	const sections = courses
		.filter((course) => course.level + 1 === level)
		.map((course) => {
			nextCourse = course
			return course.sections
		})
		.flat()
		.map((section) => {
			return {
				...section,
				course: nextCourse,
			}
		})
	return sections
}

async function interruptFinishSemester() {
	const interrupted = await $semesterService.interruptFinishSemester()
	if (interrupted) router.push('/admin/semestres')
}

async function finishCurrentSemester() {
	// Data
	const studentsRepeat = students.value
		.flat()
		.filter((student) => student.repeat)
		.map((student) => {
			return student.student._id
		})
	const studentsNextCourses = studentsVariable.value
		.flat()
		// eslint-disable-next-line array-callback-return
		.filter((student) => {
			if (student.id_next_section === 'repeat') {
				studentsRepeat.push(student.student._id)
			} else {
				return student
			}
		})
		.map((student) => {
			return {
				...student,
				student: student.student._id,
			}
		})
	const data = {} as {
		students_repeat: Array<string>
		students_next_courses: Array<{
			student: string
			id_next_section: string
		}>
	}
	if (studentsRepeat?.length > 0) data.students_repeat = studentsRepeat
	if (studentsNextCourses?.length > 0)
		data.students_next_courses = studentsNextCourses
	// Fecth
	const finished = await $semesterService.finishCurrentSemester(data)
	if (finished) router.push('/admin/semestres')
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
			<h2>Finalizar semestre</h2>
			<br />
			<!-- Data -->
			<div v-if="currentSemester">
				<h3>
					Semestre
					{{ currentSemester.year }}
					{{ currentSemester.semester }} °
				</h3>
				<br />
				<HTMLForm
					v-if="
						finishSemester?.semester_status.value === 'working' &&
						courses
					"
					:form="finishCurrentSemester"
				>
					<section v-if="currentSemester.semester === 2">
						<h3>
							<i class="fa-solid fa-repeat" /> Alumnos que repiten
							curso
						</h3>
						<div
							v-for="(section, i) in courses.flatMap((c) =>
								c.sections.map((s) => ({
									section: s,
									course: c,
								})),
							)"
							:key="`${section.section._id}-${section.course._id}`"
						>
							<h4>
								{{ section.course.course }}
								{{ section.section.section }}
								<div>
									<HTMLButtonIcon
										:click="
											() => {
												getStudentsFromCourse(
													section.section._id,
													i,
												)
											}
										"
										class-item="fa-solid fa-caret-down"
									/>
								</div>
							</h4>
							<section>
								<HTMLTable
									v-if="students && students[i]"
									:header="['Estudiante', 'RUT', 'Repite']"
								>
									<tr
										v-for="(student, j) in students[i]"
										:key="j"
									>
										<td>
											{{ student.student.name }}
											{{ student.student.first_lastname }}
											{{
												student.student.second_lastname
											}}
										</td>
										<td>{{ student.student.rut }}</td>
										<td>
											<HTMLCheckbox
												:id="student.student._id"
												v-model:checked="student.repeat"
											/>
										</td>
									</tr>
								</HTMLTable>
							</section>
							<br />
						</div>
						<h3>
							<i class="fa-solid fa-arrows-turn-to-dots" /> Cursos
							variables
						</h3>
						<section
							v-for="(section, i) in variableSections"
							:key="i"
						>
							<h4>
								{{ section.course.course }}
								{{ section.section }}
								<div>
									<HTMLButtonIcon
										:click="
											() =>
												getStudentsFromCourse(
													section._id,
													i,
													true,
												)
										"
										class-item="fa-solid fa-caret-down"
									/>
								</div>
							</h4>
							<section>
								<HTMLTable
									v-if="
										studentsVariable && studentsVariable[i]
									"
									:header="[
										'Estudiante',
										'RUT',
										'Siguiente curso - sección',
									]"
								>
									<tr
										v-for="(student, j) in studentsVariable[
											i
										]"
										:key="j"
									>
										<td>
											{{ student.student.name }}
											{{ student.student.first_lastname }}
											{{
												student.student.second_lastname
											}}
										</td>
										<td>{{ student.student.rut }}</td>
										<td>
											<HTMLSelect
												id="next_sections"
												v-model:value="
													studentsVariable[i][j]
														.id_next_section
												"
											>
												<option value="">
													Seleccione una siguiente
													secci&oacute;n
												</option>
												<option value="repeat">
													Repite
												</option>
												<option
													v-for="_ in getNextSectionsCourse(
														courses,
														section.course.level,
													)"
													:key="_._id"
													:value="section._id"
												>
													{{ section.course.course }}
													{{ section.section }}
												</option>
											</HTMLSelect>
										</td>
									</tr>
								</HTMLTable>
							</section>
							<br />
						</section>
					</section>
					<span>
						* Tendr&aacute; hasta tres d&iacute;as para cancelar
						esta acci&oacute;n
					</span>
					<HTMLButton type="submit">Finalizar semestre</HTMLButton>
				</HTMLForm>
				<section v-else>
					<span>Semestre en proceso de finalizar</span>
					<span v-if="finishSemester">
						Fecha de finalizaci&oacute;n:
						{{
							formatDate(finishSemester.close_date_semester ?? '')
						}}
					</span>
					<br />
					<HTMLButton :click="interruptFinishSemester" type="submit">
						<i class="fa-solid fa-rectangle-xmark close" />
						Interrumpir proceso de finalizaci&oacute;n de semestre
					</HTMLButton>
				</section>
			</div>
			<span v-if="!spinner && !currentSemester"
				>No existe semestre vigente</span
			>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>
	</NuxtLayout>
</template>

<style scoped>
i {
	color: var(--color-main);
}

h4 {
	display: flex;
	align-items: center;
	gap: 5px;
}

@media (max-width: 767.98px) {
	h4 {
		margin-top: 7px;
		margin-bottom: 7px;
	}
}

@media (max-width: 575.98px) {
	h4 {
		font-size: 0.9rem;
	}

	span {
		font-size: 0.75rem;
	}
}
</style>
