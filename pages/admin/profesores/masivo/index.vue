<script setup lang="ts">
// Types
import type { User } from '~~/models/user/user.model'
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
const  {
    $teacherService,
} = useNuxtApp()
// Router
const router = useRouter()

// Data
const teachers = ref<Array<Omit<Omit<User, '_id'>, 'user_type'>>>([{
    name: '',
    first_lastname: '',
    second_lastname: '',
    rut: '',
}])
// Modal
const modal = ref(false)
// Cells
const cells = ref(0)

function deleteCell(position: number) {
    teachers.value.splice(position, 1)
}

function addCells() {
    for (let i = 0; i < cells.value; i++) {
        teachers.value.push({
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
async function uploadTeachers() {
    const dataFetch = await $teacherService.uploadTeachers(teachers.value)
    if (dataFetch) router.push('/admin/profesores')
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
                        title="Subir profesores"
                        classItem="fa-solid fa-arrow-up-from-bracket"
                        :click="uploadTeachers"
                    />
                </Icons>
            </template>
            <h2>Tabla profesores</h2>
            <br />
            <HTMLTable :header="['Nombre', 'Ap. P', 'Ap. M', 'RUT', '']">
                <tr v-for="(teacher, i) in teachers" :key="i">
                    <td>
                        <HTMLInput v-model:value="teacher.name" :id="`N${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="teacher.first_lastname" :id="`FL${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="teacher.second_lastname" :id="`SL${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="teacher.rut" :id="`R${i}`" />
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
            <template #title>
                <h2>Agregar celdas</h2>
            </template>
            <HTMLForm :form="addCells">
                <label for="cells">Cantidad de celdas</label>
                <HTMLInput v-model:value="cells" type="number" id="cells" />
                <HTMLButton type="submit">Agregar celdas</HTMLButton>
            </HTMLForm>
        </Modal>
    </NuxtLayout>
</template>
