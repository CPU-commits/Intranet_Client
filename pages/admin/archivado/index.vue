<script setup lang="ts">
// Types
import type { Ref } from 'vue'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTIVE,
        UserTypesKeys.DIRECTOR,
    ],
})
// Nuxt App
const { $fetchModule, $semesterService } = useNuxtApp()
// Stores
const spinner = useSpinner()

// Data
const error: Ref<ErrorFetch | null> = ref(null)
const years: Ref<Array<{ year: number }> | null> = ref(null)
onMounted(async () => {
    try {
        years.value = await $semesterService.getYears()
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
})
</script>

<template>
    <NuxtLayout name="admin">
        <AdminPanel :nav="false">
            <h1>Archivado</h1>
            <HTMLTable v-if="years" :header="['Año', 'Info.']">
                <tr v-for="(year, i) in years" :key="i">
                    <td>{{ year.year }}</td>
                    <td>
                        <HTMLAIcon
                            class-item="fa-solid fa-info"
                            :href="`/admin/archivado/${year.year}`"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="years && years.length === 0">No hay años...</span>

            <!-- Error -->
            <Error v-if="error" :err="error" />
            <!-- Loading -->
            <SpinnerGet v-if="spinner" />
        </AdminPanel>
    </NuxtLayout>
</template>

<style scoped>
    h1 {
		font-size: 1.4rem;
	}
</style>
