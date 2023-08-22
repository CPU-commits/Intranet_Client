<script setup lang="ts">
// Types
import { UserTypesKeys } from '~~/models/user/user.model'
import { ErrorFetch } from '~~/common/fetchModule'

definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.DIRECTIVE,
		UserTypesKeys.DIRECTOR,
		UserTypesKeys.TEACHER,
	],
})
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Registros de entrada y salida - ${schoolName} - Intranet`
	: 'Registros de entrada y salida - Intranet'

const error = ref<ErrorFetch | null>(null)
</script>

<template>
	<section class="Register">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<h2>Registros de entrada y salida</h2>
		<section>
			<SearchStudents
				class-item="fa-solid fa-file-pen"
				text="Registros"
				:button="{
					isLink: true,
					href(idStudent: string) {
						return `/registros/${idStudent}`
					},
				}"
			/>
		</section>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped>
.dark-mode .Register {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Register {
	box-shadow: var(--box-shadow);
}

.Register {
	width: 100%;
	margin: 20px;
	background-color: white;
	padding: 20px;
	border-radius: 15px;
}

h2 {
	margin-bottom: 15px;
}

@media (max-width: 575.98px) {
	h2 {
		font-size: 1.2rem;
	}

	.Register {
		margin: 10px;
	}
}
</style>
