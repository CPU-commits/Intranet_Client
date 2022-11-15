<script>
// Guard
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const title = 'Admin - Intranet'

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
        <!-- Head -->
        <Head>
            <Title>{{ title }}</Title>
            <Meta name="robots" content="noindex, nofollow" />
        </Head>
        <!-- Body -->
        <h1>Admin</h1>
    </NuxtLayout>
</template>
