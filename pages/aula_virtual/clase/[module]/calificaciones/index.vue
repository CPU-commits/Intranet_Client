<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import type { GradeProgram } from '~~/models/classroom/grade.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Composable
const moduleName = useModuleName()
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(schoolName
	? `Calificaciones - ${moduleName.value} - ${schoolName} - Intranet`
	: `Calificaciones - ${moduleName.value} - Intranet`)
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
    $gradesService,
    $fetchModule,
} = useNuxtApp()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const idModule = route.params.module
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
        fatal: true,
	})
// Component
const Student = resolveComponent('ClassGradeStudent')
const Teacher = resolveComponent('ClassGradeTeacher')
// Data
const gradePrograms = ref<Array<GradeProgram> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await $gradesService.getGradePrograms(idModule)
        gradePrograms.value = dataFetch
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
})
</script>

<template>
    <NuxtLayout name="class">
        <section class="Grades">
            <!-- Head -->
            <Head>
                <Title>{{ title }}</Title>
            </Head>
            <!-- Body -->
            <component
                v-if="gradePrograms"
                :is="auth.userTypeIs(UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE)
                    ? Student
                    : Teacher"
                :gradePrograms="gradePrograms"
                :idModule="idModule"
            />

            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </section>
    </NuxtLayout>
</template>

<style>
	.Grades {
		margin: 20px;
		padding: 15px;
		border-radius: 10px;
		background-color: white;
		box-shadow: var(--box-shadow);
	}

    @media (max-width: 767.98px) {
        .GradeComponent h2 {
            font-size: 1.3rem;
            margin-bottom: 10px;
        }

        .GradeComponent h3 {
            font-size: 1rem;
        }
    }

    @media (max-width: 575.98px) {
        .Grades {
            margin: 10px;
            padding: 10px;
        }

        .GradeComponent h2 {
            font-size: 1rem;
        }

        .GradeComponent h3 {
            font-size: 0.9rem;
        }
    }
</style>
