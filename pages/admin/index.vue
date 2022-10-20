<script>
// Guard
import { UserTypesKeys } from '~~/models/user/user.model'

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
