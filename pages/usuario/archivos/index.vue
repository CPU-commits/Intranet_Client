<script setup lang="ts">
// Types
import { ComponentPublicInstance } from 'vue';
import { ErrorFetch } from '~~/common/fetchModule';
import type { UserFile } from '~~/models/file/file.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import { formatDate } from '~~/utils/format';
import { getIcon, getTypeFile } from '~~/utils/getIcon'
// Meta
useHead({
    titleTemplate: () => {
        const schoolName = useRuntimeConfig().public.COLLEGE_NAME
        return schoolName
            ? `Archivos - Usuario - ${schoolName} - Intranet`
            : 'Archivos - Usuario - Intranet'
    },
})
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
    $filesService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()

// Modal
const modalFile = ref(false)
// Form
const file = ref<FileList | null>(null)
const fileForm = reactive({
    title: '',
})
const permissionsInput = ref<Array<HTMLInputElement> | null>(null)
// Data
const userFiles = ref<Array<UserFile> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await $filesService.getFiles()
        userFiles.value = dataFetch

        permissionsInput.value = new Array(dataFetch.length)
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
})

async function uploadFile() {
    const uploadedFile = await $filesService.uploadFile(file.value, fileForm)
    if (uploadedFile !== undefined && userFiles.value)
        userFiles.value = [uploadedFile, ...userFiles.value]
}

async function deleteFile(idFile: string) {
    const deleted = await $filesService.deleteFile(idFile)
    if (deleted && userFiles.value)
        userFiles.value = userFiles.value.filter((file) => {
            if (file._id.$oid !== idFile) return file
        })
}

async function downloadFile(idFile: string) {
    const tokenFile = await $filesService.downloadFile(idFile)
    if (tokenFile) $filesService.downloadFileUrl(tokenFile)
}

function changePermissions(index: number, idFile: string) {
    if (permissionsInput.value)
        $filesService.changePermissions(
            permissionsInput.value[index].value,
            idFile,
        )
}
</script>

<template>
    <User>
        <template #title>
            <h2>Archivos</h2>
        </template>
        <section class="Content">
            <div class="Content__button">
                <HTMLButton type="button" :click="() => modalFile = true">
                    <i class="fa-solid fa-file-arrow-up" /> Subir archivo
                </HTMLButton>
            </div>
            <br />
            <HTMLTable v-if="userFiles" :header="['Tipo', 'Nombre', 'Permisos', 'Subida', 'Descargar', 'Eliminar']">
                <tr v-for="(file, i) in userFiles" :key="file._id.$oid">
                    <td>{{ file.title }}</td>
                    <td>
                        <i :class="getIcon(file.type)" class="icon" />
                        {{ getTypeFile(file.type) }}
                    </td>
                    <td>
                        <HTMLSelect
                            v-model:value="file.permissions"
                            :ref="(e) => {
                                if (e && permissionsInput)
                                    permissionsInput[i] = (e as ComponentPublicInstance).$el
                            }"
                            :change="() => changePermissions(i, file._id.$oid)"
                            id="permissions"
                        >
                            <option value="private">Privado</option>
                            <option value="public">P&uacute;blico</option>
                            <option value="public_classroom">
                                P&uacute;blico Aula Virtual
                            </option>
                        </HTMLSelect>
                    </td>
                    <td>{{ formatDate(file.date) }}</td>
                    <td>
                        <HTMLButtonIcon
                            type="button"
                            :click="() => downloadFile(file._id.$oid)"
                            class-item="fa-solid fa-file-arrow-down"
                        />
                    </td>
                    <td>
                        <HTMLButtonIcon
                            type="button"
                            :click="() => deleteFile(file._id.$oid)"
                            class-item="fa-solid fa-minus"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="userFiles && userFiles.length === 0">No hay archivos subidos...</span>
            
            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </section>

        <!-- Modals -->
        <Modal v-model:opened="modalFile">
            <template #title>
                <h2>Archivo</h2>
            </template>
            <HTMLForm :form="uploadFile">
                <label for="title">Titulo</label>
                <HTMLInput v-model:value="fileForm.title" id="title" />
                <label for="file">Archivo</label>
                <HTMLInputFiles v-model:files="file" id="file" />
                <HTMLButton type="submit">Subir archivo</HTMLButton>
            </HTMLForm>
        </Modal>
    </User>
</template>

<style scoped>
	i {
		color: white;
	}

	.icon {
		color: var(--color-main);
	}

	.Content__button {
		max-width: 200px;
	}

    @media (max-width: 767.98px) {
        h2 {
            font-size: 1.3rem;
        }
    }

    @media (max-width: 575.98px) {
        h2 {
            font-size: 1.1rem;
        }
    }
</style>
