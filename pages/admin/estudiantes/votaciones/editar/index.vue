<script setup lang="ts">
// Types
import type { Student, Students } from '~~/models/user/student.model'
import type { Voting } from '~~/models/voting/voting.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.DIRECTIVE,
    ],
})
// Nuxt app
const {
    $fetchModule,
    $studentsService,
} = useNuxtApp()
// Composoable
const spinner = useSpinner()
// Stores
const toasts = useToastsStore()

const search = ref('')
const listIndex = ref(0)
// Modal
const modalMember = ref(false)
// Data
const students = ref<Students | null>(null)
const voting = ref<Voting | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await $studentsService.getVoting()
        voting.value = dataFetch
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
})

function addList() {
    voting.value?.lists.push({
        list_name: '',
        students: [],
    })
}

// Provide total for navigate
const total = ref(0)
provide('total', total)
async function searchFunction(n = 0, getTotal = true) {
    try {
        const dataFetch = await $studentsService.getStudents(
            true,
            n,
            search.value,
            getTotal,
        )
        students.value = dataFetch
        if (getTotal) total.value = dataFetch.total ?? 0
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
}

function addMember(student: Student) {
    if (!voting.value) return

    if (!voting.value.lists.some((l) => l.students.some((m) => m._id._id === student._id))) {
        voting.value.lists[listIndex.value].students.push({
            _id: student,
            rol: '',
        })
    } else {
        toasts.addToast({
            message: 'Este alumno ya está en alguna lista',
            type: 'error',
        })
    }
}

async function updateVoting() {
    if (!voting.value) return
    const data = {
        ...voting.value,
        lists: voting.value.lists.map((list) => {
            return {
                ...list,
                students: list.students.map((student) => {
                    return {
                        _id: student._id._id,
                        rol: student.rol,
                    }
                }),
            }
        }),
    }
    await $studentsService.updateVoting(data)
}
</script>

<template>
    <NuxtLayout name="admin">
        <AdminPanel :nav="false">
            <h2>Votaciones</h2>
            <!-- Data -->
            <HTMLForm v-if="voting" :form="updateVoting">
                <h3><i class="fa-solid fa-rectangle-list" /> Listas de estudiantes</h3>
                <article v-for="(list, i) in voting.lists" class="List" :key="i">
                    <header class="List__header">
                        <span>{{ i + 1 }})</span>
                        <HTMLInput placeholder="Nombre de la lista" v-model:value="list.list_name" />
                        <HTMLButtonIcon
                            :oneHundred="false"
                            classItem="fa-solid fa-minus"
                            title="Eliminar lista"
                            :click="() => {
                                voting?.lists.splice(i, 1)
                            }"
                        />
                    </header>
                    <h4>
                        <i class="fa-solid fa-people-group" />
                        Miembros
                        <HTMLButtonIcon
                            classItem="fa-solid fa-circle-plus"
                            :click="() => {
                                modalMember = true
                                listIndex = i
                            }"
                            title="Añadir miembro"
                            :oneHundred="false"
                        />
                    </h4>
                    <br />
                    <HTMLTable :header="['Estudiante', 'Rol', '']">
                        <tr v-for="(student, j) in list.students" :key="j">
                            <td>
                                {{ student._id.name }}
                                {{ student._id.first_lastname }}
                                {{ student._id.second_lastname }}
                            </td>
                            <td>
                                <HTMLInput v-model:value="student.rol" />
                            </td>
                            <td>
                                <HTMLButtonIcon
                                    :oneHundred="false"
                                    title="Eliminar miembro"
                                    classItem="fa-solid fa-circle-minus"
                                    :click="() => {
                                        list.students.splice(j, 1)
                                    }"
                                />
                            </td>
                        </tr>
                    </HTMLTable>
                    <span v-if="list.students.length === 0">
                        Sin miembros
                    </span>
                </article>

                <HTMLButtonIcon
                    classItem="fa-solid fa-plus"
                    :click="addList"
                    title="Añadir lista"
                />
                <label for="start">Fecha comienzo votaciones</label>
                <HTMLInput type="date" id="start" v-model:value="voting.start_date" />
                <label for="finish">Fecha termino votaciones</label>
                <HTMLInput type="date" id="finish" v-model:value="voting.finish_date" />
                <label for="period">Periodo de direcci&oacute;n (Meses)</label>
                <HTMLInput type="number" id="period" v-model:value="voting.period" />
                <HTMLButton type="submit">Editar votaciones</HTMLButton>
            </HTMLForm>
            
            <SpinnerGet v-if="spinner" />
            <Error v-if="error" :err="error" />
        </AdminPanel>

        <Modal v-model:opened="modalMember">
            <template #title>
                <h2>Añadir miembro</h2>
            </template>
            <HTMLSearch v-model:value="search" :search="searchFunction" />
            <br />
            <HTMLTable v-if="students" :header="['Nombre', 'RUT', '']">
                <tr v-for="student in students.users" :key="student._id">
                    <td>
                        {{ student.name }}
                        {{ student.first_lastname }}
                        {{ student.second_lastname }}
                    </td>
                    <td>{{ student.rut }}</td>
                    <td>
                        <HTMLButtonIcon
                            classItem="fa-solid fa-square-plus"
                            :click="() => addMember(student)"
                            title="Seleccionar alumno"
                        />
                    </td>
                </tr>
            </HTMLTable>

            <SpinnerGet v-if="spinner" />
            <Error v-if="error" :err="error" />
        </Modal>
    </NuxtLayout>
</template>

<style>
	.List {
		padding: 15px;
	}

	.List__header {
		display: flex;
		gap: 5px;
		align-items: center;
	}

	h4 {
		margin-top: 10px;
		display: flex;
		gap: 5px;
		align-items: center;
	}
</style>
