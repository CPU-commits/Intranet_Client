<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import { Semester } from '~~/models/semester/semester.model';
import { UserTypesKeys } from '~~/models/user/user.model'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.TEACHER,
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.DIRECTIVE,
    ],
})
// Nuxtapp
const {
    $fetchModule,
    $semesterService,
    $gradesService,
    $filesService,
} = useNuxtApp()
// Stores
const toasts = useToastsStore()
// Composable
const spinner = useSpinner()

// Data
const semesters = ref<Array<Semester> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        semesters.value = await $semesterService.getParticipatedSemesters()
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
})

async function getGrades(idSemester: string) {
    try {
        const gradeURL = await $gradesService.downloadGradesSemester(idSemester)
        $filesService.downloadFileUrl(gradeURL)
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        toasts.addToast({
            message: _err.message,
            type: 'error',
        })
    }
}
</script>

<template>
    <User>
        <template #title>
            <h2>Calificaciones</h2>
        </template>
        <!-- Data -->
        <HTMLTable v-if="semesters" :header="['Semestre', 'Calificaciones']">
            <tr v-for="semester in semesters" :key="semester._id">
                <td>{{ semester.year }} {{ semester.semester }}°</td>
                <td>
                    <HTMLButton type="button" :click="() => getGrades(semester._id)">
                        <i class="fa-solid fa-highlighter" />
                    </HTMLButton>
                </td>
            </tr>
        </HTMLTable>
        
        <SpinnerGet v-if="spinner" />
        <Error v-if="error" :err="error" />
    </User>
</template>

<style scoped>
	i {
		color: white;
	}
</style>
