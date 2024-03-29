<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import type { Publication } from '~~/models/classroom/publication.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(
	schoolName
		? `- Publicación - ${schoolName} - Intranet`
		: `- Publicación - Intranet`,
)
// Guard
definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.STUDENT,
		UserTypesKeys.STUDENT_DIRECTIVE,
		UserTypesKeys.TEACHER,
	],
})
// Nuxtapp
const { $fetchModule, $publicationsService } = useNuxtApp()
// Router
const route = useRoute()

const idModule = route.params.module
const idPublication = route.params.publication
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
		fatal: true,
	})
if (typeof idPublication !== 'string')
	throw createError({
		message: '[publication] must be a string',
		statusCode: 400,
		fatal: true,
	})
// Data
const publication = ref<Publication | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		publication.value = await $publicationsService.getPublication(
			idModule,
			idPublication,
		)
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})
</script>

<template>
	<section class="Publication">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<ClassPublication
			v-if="publication"
			:publication="publication"
			:id-module="idModule"
		/>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped>
.Publication {
	margin: 20px;
	widows: 100%;
	max-width: 800px;
	box-sizing: border-box;
}
</style>
