<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import type { Author } from '~~/models/library/author.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import { formatDate } from '~~/utils/format'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Autores - Biblioteca Virtual - Admin - ${schoolName} - Intranet`
	: 'Autores - Biblioteca Virtual - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.DIRECTIVE,
		UserTypesKeys.DIRECTOR,
		UserTypesKeys.LIBRARIAN,
	],
})
// Nuxtapp
const { $libraryService, $fetchModule } = useNuxtApp()

// Promises
const authors = ref<Array<Author> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		authors.value = await $libraryService.getAuthors()
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

// Functions
async function deleteAuthor(idAuthor: string) {
	const dataFetch = await $libraryService.deleteAuthor(idAuthor)
	if (dataFetch && authors.value)
		authors.value = authors.value.filter(
			(author) => author._id !== idAuthor,
		)
}
</script>

<template>
	<NuxtLayout name="admin">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<AdminPanel>
			<template #nav>
				<Icons>
					<HTMLAIcon
						title="Nuevo autor"
						href="/admin/biblioteca/autores/nuevo_autor"
						class-item="fa-solid fa-plus"
					/>
				</Icons>
			</template>
			<h2>Autores</h2>
			<!-- Data -->
			<br />
			<HTMLTable
				:header="['Nombre', 'Fecha', 'Ver entrada', 'Editar', '']"
			>
				<tr v-for="author in authors" :key="author._id">
					<td>{{ author.name }}</td>
					<td>{{ formatDate(author.date_update) }}</td>
					<td>
						<HTMLAIcon
							:href="`/biblioteca/autor/${author.slug}`"
							class-item="fa-solid fa-pager"
						/>
					</td>
					<td>
						<HTMLAIcon
							target="'_blank'"
							:href="`/admin/biblioteca/autores/editar/${author.slug}`"
							class-item="fa-solid fa-pen-to-square"
						/>
					</td>
					<td>
						<HTMLButtonIcon
							title="Eliminar autor"
							class-item="fa-solid fa-circle-minus"
							:click="() => deleteAuthor(author._id)"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="authors && authors.length === 0">Sin autores...</span>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>
	</NuxtLayout>
</template>
