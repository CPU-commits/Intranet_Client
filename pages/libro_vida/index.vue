<script setup lang="ts">
// Types
import type { Student } from '~~/models/user/student.model'
import { UserTypesKeys } from '~~/models/user/user.model';
import { ErrorFetch } from '~~/common/fetchModule';
// Nuxtapp
const {
    $fetchModule,
    $studentsService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()
// Stores
const auth = useAuthStore()

// Data
const students = ref<Array<Student> | null>(null)

const error = ref<ErrorFetch | null>(null)
// Provide total for navigate
const total = ref(0)
provide('total', total)

async function getStudents(getTotal: boolean = false, skip?: number) {
    try {
        const dataFetch = await $studentsService.getStudents(
            getTotal,
            skip,
            search.value,
            true,
        )
        console.log(dataFetch)
        if (getTotal || !students.value) {
            students.value = dataFetch.users
            total.value = dataFetch.total ?? 0
        }
        else students.value.push(...dataFetch.users)
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
}
// Form
const search = ref('')
</script>

<template>
    <section class="BookLife">
        <h2>Libro de vida</h2>
        <section v-if="auth.userTypeNotIs(UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE)">
            <HTMLSearch
                placeholder="Buscar alumno"
                :search="() => getStudents(true)"
                v-model:value="search"
            />
            <br />
            <HTMLTable 
                :header="['Rut', 'Nombre', 'Curso', 'Libro de vida']"
                :navigate="{
                    max: 30,
                    activate: true,
                    fn(n) {
                        getStudents(false, n)
                    },
                }"
            >
                <tr v-for="student in students" :key="student._id">
                    <td>{{ student.rut }}</td>
                    <td>{{ student.name }} {{ student.first_lastname }}</td>
                    <td v-if="student.course">
                        {{ student.course.course.course }}
                        {{ student.course.section }}
                    </td>
                    <td v-else>Sin curso</td>
                    <td>
                        <HTMLAIcon
                            :href="`/libro_vida/${student._id}`"
                            classItem="fa-solid fa-book-open"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="students && students.length === 0">No hay alumnos...</span>
        </section>
        <Booklife v-else />

        <SpinnerGet />
        <Error v-if="error" :err="error" />
    </section>
</template>

<style scoped>
	.BookLife {
        width: 100%;
		margin: 20px;
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
		border-radius: 15px;
	}

	h2 {
		margin-bottom: 15px;
	}
</style>
