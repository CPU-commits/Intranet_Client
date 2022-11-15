<script setup lang="ts">
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Libro de Vida - Estudiante - ${schoolName} - Intranet`
	: 'Libro de Vida - Estudiante - Intranet'
// Guard
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
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
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

@media (max-width: 767.98px) {
	.BookLife {
		margin: 15px;
		padding: 10px;
	}
}

@media (max-width: 575.98px) {
	h2 {
		font-size: 1.2rem;
	}

	.BookLife {
		margin: 10px;
	}
}
</style>
