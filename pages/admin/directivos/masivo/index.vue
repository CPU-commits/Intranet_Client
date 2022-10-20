<script setup lang="ts">
// Types
import type { User } from '~~/models/user/user.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [ UserTypesKeys.DIRECTOR ],
})
// Router
const router = useRouter()
// Nuxtapp
const {
    $directivesService,
} = useNuxtApp()

// Data
const directives = ref<Array<User>>([{
    name: '',
    first_lastname: '',
    second_lastname: '',
    rut: '',
} as User])
// Modal
const modal = ref(false)
// Cells
const cells = ref(0)

function deleteCell(position: number) {
    directives.value.splice(position, 1)
}

function addCells() {
    for (let i = 0; i < cells.value; i++) {
        directives.value.push({
            name: '',
            first_lastname: '',
            second_lastname: '',
            rut: '',
        } as User)
    }
    cells.value = 0
    modal.value = false
}
// Upload data
async function uploadDirectives() {
    const dataFetch = await $directivesService.uploadDirectives(directives.value)
    if (dataFetch)
        router.push('/admin/directivos')
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
                        title="Subir directivos"
                        classItem="fa-solid fa-arrow-up-from-bracket"
                        :click="uploadDirectives"
                    />
                </Icons>
            </template>
            <h2>Tabla directivos</h2>
            <br />
            <HTMLTable :header="['Nombre', 'Ap. P', 'Ap. M', 'RUT', '']">
                <tr v-for="(directive, i) in directives" :key="i">
                    <td>
                        <HTMLInput v-model:value="directive.name" :id="`N${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="directive.first_lastname" :id="`FL${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="directive.second_lastname" :id="`SL${i}`" />
                    </td>
                    <td>
                        <HTMLInput v-model:value="directive.rut" :id="`R${i}`" />
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
