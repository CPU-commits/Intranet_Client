<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
    ? `Colegio - Admin - ${schoolName} - Intranet`
    : 'Colegio - Admin - Intranet'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [ UserTypesKeys.DIRECTOR ],
})
// Nuxtapp
const {
    $fetchModule,
    $collegeService,
} = useNuxtApp()

// Data
const college = reactive({
    direction: '',
    phone: '',
    email: '',
})

const error = ref<ErrorFetch | null>(null)

onMounted(async () => {
    try {
        const dataFetch = await $collegeService.getCollege()
        college.direction = dataFetch.direction
        college.phone = dataFetch.phone
        college.email = dataFetch.email
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
})
</script>

<template>
    <NuxtLayout name="admin">
        <!-- Head -->
        <Head>
            <Title>{{ title }}</Title>
            <Meta name="robots" content="noindex, nofollow" />
        </Head>
        <!-- Body -->
        <AdminPanel :nav="false">
            <!-- Data -->
            <h2>Colegio</h2>
            <br />
            <HTMLVerticalTable>
                <tr>
                    <td>Dirección</td>
                    <td><HTMLInput v-model:value="college.direction" /></td>
                </tr>
                <tr>
                    <td>Telef&oacute;no</td>
                    <td><HTMLInput v-model:value="college.phone" /></td>
                </tr>
                <tr>
                    <td>Email</td>
                    <td><HTMLInput v-model:value="college.email" type="email" /></td>
                </tr>
            </HTMLVerticalTable>
            <br />
            <HTMLButton :click="() => $collegeService.uploadCollegeData(college)" type="button">
                Actualizar datos
            </HTMLButton>

            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </AdminPanel>
    </NuxtLayout>    
</template>
