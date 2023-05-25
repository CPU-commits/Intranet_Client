<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Publication } from '~~/models/classroom/publication.model'
import { UserTypesKeys } from '~~/models/user/user.model'

// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(schoolName ? ` - ${schoolName} - Intranet` : `Intranet`)
// Guard
definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.STUDENT,
		UserTypesKeys.STUDENT_DIRECTIVE,
		UserTypesKeys.TEACHER,
		UserTypesKeys.ATTORNEY,
	],
	scrollToTop: true,
})
// Nuxtapp
const { $fetchModule, $publicationsService } = useNuxtApp()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const _section = ref(getSection())
const idModule = route.params.module as string

// Data
const publications = ref<Map<number, Array<Publication>>>(new Map())

onMounted(() => replaceData(true))

function getSection() {
	return route.query.section ? parseInt(route.query.section as string) : 0
}

watch(
	() => route.query.section,
	() => {
		_section.value = getSection()
		replaceData(true)
	},
)

const error = ref<ErrorFetch | null>(null)
async function replaceData(total = false, skip = 0, limit?: number) {
	let query = `&skip=${skip}&total=${total}`
	if (limit) query += `&limit=${limit}`
	try {
		const dataFetch = await $publicationsService.getPublications(
			idModule,
			_section.value,
			query,
		)
		if (total)
			publications.value.set(_section.value, dataFetch.publications)
		else
			publications.value
				.get(_section.value)
				?.push(...dataFetch.publications)
		if (total)
			onScroll({
				total: dataFetch.total,
				max: 20,
				async fx(n) {
					const dataFetch = await replaceData(false, n + 1)
					if (dataFetch) return n + 20
					else return n
				},
			})
		return true
	} catch (err) {
		error.value = $fetchModule.handleError(err)
		return false
	}
}

function newPublication(publication: Publication) {
	if (publications.value)
		publications.value.get(_section.value)?.unshift(publication)
}

function deletePublication(index: number) {
	if (publications.value)
		publications.value.get(_section.value)?.splice(index, 1)
}
</script>

<template>
	<NuxtLayout name="class">
		<section class="Publications">
			<!-- Head -->
			<Head>
				<Title>{{ title }}</Title>
				<Meta name="robots" content="noindex, nofollow" />
			</Head>
			<!-- Body -->
			<section class="Publications__content">
				<ClientOnly>
					<div
						v-if="auth.userTypeIs(UserTypesKeys.TEACHER)"
						class="Publications__write"
					>
						<ClassPublicationWrite
							:_section="_section"
							@new-publication="(p: Publication) => newPublication(p)"
						/>
					</div>
				</ClientOnly>
				<template v-if="publications.get(_section)?.length ?? 0 > 0">
					<ClassPublication
						v-for="(publication, i) in publications.get(_section)"
						:key="publication._id"
						:can-edit="auth.userTypeIs(UserTypesKeys.TEACHER)"
						:id-module="idModule"
						:publication="publication"
						@delete="() => deletePublication(i)"
					/>
				</template>
				<div v-else class="Empty">
					<img src="/img/empty.svg" alt="Contenido Vacío" />
					<span>
						Parece que est&aacute; todo vac&iacute;o por
						aqu&iacute;...
					</span>
				</div>
				<SpinnerGet />
				<Error v-if="error" :err="error" />
			</section>
		</section>
	</NuxtLayout>
</template>

<style scoped>
.Publications {
	padding: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

.Publications__content {
	width: 100%;
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	gap: 40px;
}

.Empty {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.Empty img {
	height: 300px;
	margin-bottom: 30px;
}

@media (max-width: 575.98px) {
	.Publications {
		padding: 10px;
	}

	.Publications__content {
		gap: 20px;
	}
}
</style>
