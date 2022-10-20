<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import type { GradeProgram } from '~~/models/classroom/grade.model'
import { UserTypesKeys } from '~~/models/user/user.model'
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
// Composable
const spinner = useSpinner()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const idModule = route.params.module
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
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
            <component
                v-if="gradePrograms"
                :is="auth.userTypeIs(UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE)
                    ? Student
                    : Teacher"
                :gradePrograms="gradePrograms"
                :idModule="idModule"
            />

            <SpinnerGet v-if="spinner" />
            <Error v-if="error" :err="error" />
        </section>
    </NuxtLayout>
</template>

<style scoped>
	.Grades {
		margin: 20px;
		padding: 15px;
		border-radius: 10px;
		background-color: white;
		box-shadow: var(--box-shadow);
	}
</style>
