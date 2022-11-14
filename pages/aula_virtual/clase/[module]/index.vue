<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import type { Publication } from '~~/models/classroom/publication.model'
import { UserTypesKeys } from '~~/models/user/user.model';
import onScroll from '~~/utils/onScroll'
// Composable
const moduleName = useModuleName()
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(schoolName
	? `${moduleName.value} - ${schoolName} - Intranet`
	: `${moduleName.value} - Intranet`)
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
const {
    $fetchModule,
    $publicationsService,
} = useNuxtApp()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const _section = ref(getSection())
const idModule = route.params.module as string

// Data
const publications = ref<Array<Publication> | null>(null)

onMounted(() => replaceData(true))

function getSection() {
    return route.query.section
        ? parseInt(route.query.section as string)
        : 0
}

watch(() => route.query.section, (newValue) => {
    _section.value = getSection()
    replaceData(true)
})

const error = ref<ErrorFetch | null>(null)
async function replaceData(total = false, skip: number = 0, limit?: number) {
    let query = `&skip=${skip}&total=${total}`
    if (limit) query += `&limit=${limit}`
    try {
        const dataFetch = await $publicationsService.getPublications(
            idModule,
            _section.value,
            query,
        )
        if (!publications.value || total) publications.value = dataFetch.publications
        else publications.value.push(...dataFetch.publications)
        if (total)
			onScroll({
				total: dataFetch.total,
				max: 20,
				async fx(n) {
					const dataFetch = await replaceData(false, n + 1)
					if (dataFetch) return n + 20
					else return n
				}
			})
		return true
    } catch (err) {
		error.value = $fetchModule.handleError(err)
		return false
    }
}

function newPublication(publication: Publication) {
	if (publications.value) publications.value.unshift(publication)
}

function deletePublication(index: number) {
	if (publications.value) publications.value.splice(index, 1)
}
</script>

<template>
	<NuxtLayout name="class">
		<section class="Publications">
			<!-- Head -->
			<Head>
				<Title>{{ title }}</Title>
			</Head>
			<!-- Body -->
			<section class="Publications__content">
				<div class="Publications__write">
					<ClassPublicationWrite
						v-if="auth.userTypeIs(UserTypesKeys.TEACHER)"
						:_section="_section"
						@newPublication="(p: Publication) => newPublication(p)"
					/>
				</div>
				<ClassPublication
					v-if="publications"
					v-for="(publication, i) in publications"
					:key="publication._id"
					:canEdit="auth.userTypeIs(UserTypesKeys.TEACHER)"
					:idModule="idModule"
					:publication="publication"
					@delete="() => deletePublication(i)"
				/>
				<div v-if="publications && publications.length === 0" class="Empty">
					<img src="/img/empty.svg" alt="Contenido Vacío" />
					<span>Parece que est&aacute; todo vac&iacute;o por aqu&iacute;...</span>
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
