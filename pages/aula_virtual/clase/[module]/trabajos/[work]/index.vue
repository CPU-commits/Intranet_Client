<script setup lang="ts">
import { ErrorFetch } from '~~/common/fetchModule'
import { Work } from '~~/models/classroom/work.model'
import { StudentAccess } from '~~/models/classroom/students_access.model'
import { FormAccess } from '~~/models/classroom/form_access.model'
import { FilesUploadedClassroom } from '~~/models/file/files_uploaded.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { Grade } from '~~/models/classroom/grade.model'
import { formatDate } from '~~/utils/format'
// Composable
const moduleName = useModuleName()
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(schoolName
	? `Trabajo - ${moduleName.value} - ${schoolName} - Intranet`
	: `Trabajo - ${moduleName.value} - Intranet`)
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.STUDENT,
        UserTypesKeys.STUDENT_DIRECTIVE,
        UserTypesKeys.TEACHER,
    ],
})
// Nuxtapp
const {
    $fetchModule,
    $workService,
} = useNuxtApp()
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
const ClassWorkTeacher = resolveComponent('ClassWorkTeacher')
// Data
const work = ref<Work | null>(null)
const form_access = ref<FormAccess | null>(null)
const formHasPoints = ref(false)
// Teacher
const students = ref<Array<StudentAccess> | null>(null)
const totalPoints = ref<number | null>(null)
// Student
const files_uploaded = ref<FilesUploadedClassroom | null>(null)
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
            Promise<{
                students: Array<StudentAccess>
                total_points: number
            }>?
        ] = [$workService.getWork(idWork)]
        if (auth.userTypeIs(UserTypesKeys.TEACHER))
            promises.push(
                $workService.getStudentsStatus(
                    idModule,
                    idWork,
                ),
            )

        const dataFetch = await Promise.all(promises)
        work.value = dataFetch[0].work
        form_access.value = dataFetch[0].form_access

        if (auth.userTypeIs(UserTypesKeys.TEACHER) && dataFetch[1]) {
            formHasPoints.value = dataFetch[0].form_has_points ?? false
            // Teacher
            students.value = dataFetch[1].students
            totalPoints.value = dataFetch[1].total_points
        } else {
            files_uploaded.value = dataFetch[0].files_uploaded
            grade.value = dataFetch[0].grade
        }
        // Fix obj null
        if (work.value?.attached?.length === 1 && work.value.attached[0]._id === '')
            work.value.attached = null
		// Title
		title.value = schoolName
			? `${work.value.title} - ${moduleName.value} - ${schoolName} - Intranet`
			: `${work.value.title} - ${moduleName.value} - Intranet`
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
})
</script>

<template>
	<NuxtLayout name="class">
		<section class="Work">
			<!-- Head -->
            <Head>
                <Title>{{ title }}</Title>
            </Head>
            <!-- Body -->
			<template v-if="work">
				<header>
					<h2>
						<i v-if="work.type === 'form'" class="fa-solid fa-clipboard"></i>
						<i v-else class="fa-solid fa-file-arrow-up"></i>
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
				<p v-if="work.description && work.description !== ''" class="Work__description">
					{{ work.description }}
				</p>
				<section v-if="work.attached && work.attached.length > 0" class="Work__attached">
					<h4><i class="fa-solid fa-paperclip" /> Adjunto</h4>
					<template v-for="(attached, i) in work.attached" :key="i">
						<CloudFile
							v-if="attached.type === 'file'"
							:idModule="idModule"
							:isClassroom="true"
							:minimalist="true"
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
						:is="auth.userTypeIs(UserTypesKeys.TEACHER)
							? ClassWorkTeacher
							: ClassWorkStudent"
						:idWork="idWork"
						:idModule="idModule"
						:formHasPoints="formHasPoints"
						:totalPoints="totalPoints"
						:work="work"
						:students="students"
						:form_access="form_access"
						:files_uploaded="files_uploaded"
						:grade="grade"
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
	.Work {
		background-color: white;
		margin: 15px;
		padding: 15px;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
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

	.Work__content section {
		padding: 20px;
		border: 2px solid var(--color-light);
		margin: 20px;
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
			margin: 10px;
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
