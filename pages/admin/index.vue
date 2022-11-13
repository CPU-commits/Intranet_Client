<script>
// Guard
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
useHead({
    titleTemplate: () => {
        const schoolName = useRuntimeConfig().public.COLLEGE_NAME
        return schoolName
            ? `Admin - ${schoolName} - Intranet`
            : 'Admin - Intranet'
    },
})

definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTIVE,
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.LIBRARIAN,
    ],
})
</script>

<template>
    <NuxtLayout name="admin">
        <h1>Admin</h1>
    </NuxtLayout>
</template>
