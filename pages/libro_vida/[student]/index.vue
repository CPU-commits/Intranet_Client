<script setup lang="ts">
// Guard
import { UserTypesKeys } from '~~/models/user/user.model'

definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTIVE,
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.TEACHER,
    ],
})
// Router
const route = useRoute()

const idStudent = route.params.student
if (typeof idStudent !== 'string') 
    throw createError({
        message: '[student] must be a string',
        statusCode: 400,
        fatal: true,
    })
</script>

<template>
    <section class="BookLife">
        <h2>Libro de vida</h2>
        <Booklife :id-student="idStudent" />
    </section>
</template>

<style scoped>
	.BookLife {
        width: 100%;
		margin: 20px;
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
		border-radius: 15px;
	}

	h2 {
		margin-bottom: 15px;
	}
</style>
