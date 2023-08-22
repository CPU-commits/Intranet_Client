<script setup lang="ts">
import { ErrorFetch } from '~~/common/fetchModule'
import { Work } from '~~/models/classroom/work.model'
import { StudentAccess } from '~~/models/classroom/students_access.model'
import { FormAccess } from '~~/models/classroom/form_access.model'
import { FilesUploadedClassroom } from '~~/models/file/files_uploaded.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { Grade } from '~~/models/classroom/grade.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(
	schoolName
		? ` - Trabajo - ${schoolName} - Intranet`
		: ` - Trabajo - Intranet`,
)
// Guard
definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.STUDENT,
		UserTypesKeys.STUDENT_DIRECTIVE,
		UserTypesKeys.TEACHER,
		UserTypesKeys.ATTORNEY,
	],
})
// Nuxtapp
const { $fetchModule, $workService } = useNuxtApp()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const idModule = route.params.module
const idWork = route.params.work
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
		fatal: true,
	})
if (typeof idWork !== 'string')
	throw createError({
		message: '[work] must be a string',
		statusCode: 400,
		fatal: true,
	})

// Components
const ClassWorkStudent = resolveComponent('ClassWorkStudent')
const ClassWorkParent = resolveComponent('ClassWorkParent')
const ClassWorkTeacher = resolveComponent('ClassWorkTeacher')
// Data
const work = ref<Work | null>(null)
const formAccess = ref<FormAccess | null>(null)
const formHasPoints = ref(false)
// Teacher
const students = ref<Array<StudentAccess> | null>(null)
const totalPoints = ref<number | null>(null)
// Student
const filesUploaded = ref<FilesUploadedClassroom | null>(null)
const grade = ref<Grade | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const promises: [
			Promise<{
				work: Work
				files_uploaded: FilesUploadedClassroom
				form_access: FormAccess
				form_has_points: boolean
				grade: Grade
			}>,
			Promise<void>?,
		] = [$workService.getWork(idWork)]
		if (auth.userTypeIs(UserTypesKeys.TEACHER, UserTypesKeys.ATTORNEY))
			promises.push(getStudents())

		const dataFetch = await Promise.all(promises)
		work.value = dataFetch[0].work
		formAccess.value = dataFetch[0].form_access

		if (auth.userTypeNotIs(UserTypesKeys.TEACHER, UserTypesKeys.ATTORNEY)) {
			filesUploaded.value = dataFetch[0].files_uploaded
			grade.value = dataFetch[0].grade
		} else {
			formHasPoints.value = dataFetch[0].form_has_points ?? false
		}
		// Fix obj null
		if (
			work.value?.attached?.length === 1 &&
			work.value.attached[0]._id === ''
		)
			work.value.attached = null
		// Title
		title.value = schoolName
			? `- ${work.value.title} - ${schoolName} - Intranet`
			: `- ${work.value.title} - Intranet`
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

async function getStudents() {
	const studentsData = await $workService.getStudentsStatus(
		idModule as string,
		idWork as string,
	)
	// Teacher
	students.value = studentsData.students
	totalPoints.value = studentsData.total_points
}
</script>

<template>
	<NuxtLayout name="class">
		<section class="Work">
			<!-- Head -->
			<Head>
				<Title>{{ title }}</Title>
				<Meta name="robots" content="noindex, nofollow" />
			</Head>
			<!-- Body -->
			<template v-if="work">
				<header>
					<h2>
						<i
							v-if="work.type === 'form'"
							class="fa-solid fa-clipboard"
						></i>
						<i
							v-else-if="work.type === 'files'"
							class="fa-solid fa-file-arrow-up"
						></i>
						<i v-else class="fa-solid fa-school-flag"></i>
						{{ work.title }}
					</h2>
					<div v-if="work.is_qualified" class="Grade">
						<small>
							<i class="fa-solid fa-certificate" />
							Calificado ({{ work.grade.number }}° -
							{{ work.grade.percentage }}%)
						</small>
						<small v-if="work.grade.is_acumulative">
							Calificación acumulativa
							{{ work.grade.acumulative[0].number }}° -
							{{ work.grade.acumulative[0].percentage }}%
						</small>
					</div>
				</header>
				<p
					v-if="work.description && work.description !== ''"
					class="Work__description"
				>
					{{ work.description }}
				</p>
				<section
					v-if="work.attached && work.attached.length > 0"
					class="Work__attached"
				>
					<h4><i class="fa-solid fa-paperclip" /> Adjunto</h4>
					<!-- eslint-disable-next-line vue/no-v-for-template-key -->
					<template v-for="(attached, i) in work.attached" :key="i">
						<CloudFile
							v-if="attached.type === 'file'"
							:id-module="idModule"
							:is-classroom="true"
							:minimalist="true"
							:can-download="true"
							:file="attached.file"
						/>
						<ClassLink
							v-else-if="attached.type === 'link'"
							:minimalist="true"
							:link="{
								title: attached.title,
								link: attached.link,
							}"
						/>
					</template>
				</section>
				<section class="Work__content">
					<component
						:is="
							auth.userTypeIs(UserTypesKeys.TEACHER)
								? ClassWorkTeacher
								: auth.userTypeIs(UserTypesKeys.ATTORNEY)
								? ClassWorkParent
								: ClassWorkStudent
						"
						:id-work="idWork"
						:id-module="idModule"
						:form-has-points="formHasPoints"
						:total-points="totalPoints"
						:work="work"
						:students="students"
						:form_access="formAccess"
						:files_uploaded="filesUploaded"
						:grade="grade"
						@update="getStudents"
					/>
				</section>
				<footer>
					<small>
						Publicado por
						<span>
							{{ work.author.name }}
							{{ work.author.first_lastname }}
						</span>
					</small>
					<small>
						Fecha cierre:
						{{ formatDate(work.date_limit) }}
					</small>
				</footer>
			</template>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</section>
	</NuxtLayout>
</template>

<style scoped>
.dark-mode .Work {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Work {
	box-shadow: var(--box-shadow);
}

.Work {
	background-color: white;
	margin: 15px;
	padding: 15px;
	border-radius: 10px;
}

header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.Work__description {
	padding: 10px;
	border-bottom: 2px solid var(--color-light);
}

.Work__attached {
	padding: 5px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

i {
	color: var(--color-main);
}

.Work__content {
	overflow-x: auto;
	display: flex;
	justify-content: center;
}

.Work__content section {
	padding: 20px;
	margin: 20px;
	width: fit-content;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
}

footer {
	display: flex;
	justify-content: space-between;
}

footer span {
	color: var(--color-main);
}

footer small:last-child {
	text-align: right;
}

@media (max-width: 767.98px) {
	h2 {
		font-size: 1.3rem;
	}

	small {
		font-size: 0.75rem;
	}
}

@media (max-width: 575.98px) {
	.Work {
		margin: 10px;
		padding: 10px;
	}

	h2 {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1rem;
		width: fit-content;
	}

	.Work__description {
		padding: 8px;
		font-size: 0.8rem;
	}

	.Work__content section {
		padding: 10px;
		margin: 10px 0;
		gap: 10px;
	}

	.Grade {
		text-align: right;
	}

	small {
		font-size: 0.65rem;
	}
}
</style>
