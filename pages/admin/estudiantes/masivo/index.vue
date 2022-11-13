<script setup lang="ts">
// Types
import type { Student } from '~~/models/user/student.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
useHead({
    titleTemplate: () => {
        const schoolName = useRuntimeConfig().public.COLLEGE_NAME
        return schoolName
            ? `Estudiantes - Masivo - Admin - ${schoolName} - Intranet`
            : 'Estudiantes - Masivo - Admin - Intranet'
    },
})
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.DIRECTIVE,
    ],
})
// Nuxtapp
const { $studentsService } = useNuxtApp()
// Router
const router = useRouter()

// Data
const students = ref<Array<Omit<Omit<Omit<Student, '_id'>, 'user_type'>, 'course'>>>([{
    name: '',
    first_lastname: '',
    second_lastname: '',
    rut: '',
    registration_number: '',
}])
// Modal
const modal = ref(false)
// Cells
const cells = ref(0)

function deleteCell(position: number) {
    students.value.splice(position, 1)
}

function addCells() {
    for (let i = 0; i < cells.value; i++) {
        students.value.push({
            name: '',
            first_lastname: '',
            second_lastname: '',
            rut: '',
        })
    }
    cells.value = 0
    modal.value = false
}
// Upload data
async function uploadStudents() {
    const dataFetch = await $studentsService.uploadStudents(students.value)
    if (dataFetch) router.push('/admin/estudiantes')
}
</script>

<template>
    <NuxtLayout name="admin">
        <AdminPanel>
            <template #nav>
                <Icons slot="nav">
                    <HTMLButtonIcon
                        title="Agregar celdas"
                        classItem="fa-solid fa-plus"
                        :click="() => modal = true"
                    />
                    <HTMLButtonIcon
                        title="Subir estudiantes"
                        classItem="fa-solid fa-arrow-up-from-bracket"
                        :click="uploadStudents"
                    />
                </Icons>
            </template>
            <h2>Tabla estudiantes</h2>
            <br />
            <HTMLTable :header="['Nombre', 'Ap. P', 'Ap. M', 'RUT', 'Matricula', '']">
                <tr v-for="(student, i) in students" :key="i">
                    <td>
                        <HTMLInput v-model:value="student.name" :id="`N${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="student.first_lastname" :id="`FL${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="student.second_lastname" :id="`SL${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="student.rut" :id="`R${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="student.registration_number" :id="`RN${i}`" />
                    </td>
                    <td>
                        <HTMLButtonIcon
                            :click="() => deleteCell(i)"
                            classItem="fa-solid fa-minus"
                        />
                    </td>
                </tr>
            </HTMLTable>
        </AdminPanel>

        <!-- Modals -->
        <Modal v-model:opened="modal">
            <h2 slot="title">Agregar celdas</h2>
            <HTMLForm :form="addCells">
                <label for="cells">Cantidad de celdas</label>
                <HTMLInput v-model:value="cells" type="number" id="cells" />
                <HTMLButton type="submit">Agregar celdas</HTMLButton>
            </HTMLForm>
        </Modal>
    </NuxtLayout>
</template>
