<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import { formatDate } from '~~/utils/format'
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
	$moduleService,
	$fetchModule,
} = useNuxtApp()
// Composable
const spinner = useSpinner()
// Router
const route = useRoute()

const idModule = route.params.module
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
		fatal: true,
	})

// Data
const search = ref('')
const works = ref<Array<{
    _id: string
    title: string
    description: string
    date_start: string
    date_limit: string
    author: string
    published: string
}>>([])
const publications = ref<Array<{
    _id: string
    content: string
    author: string
    published: string
}>>([])

const error = ref<ErrorFetch | null>(null)
async function searchFunction() {
	error.value = null
    try {
        const dataFetch = await $moduleService.search(idModule as string, search.value)
        dataFetch.hits.forEach((hit) => {
            if (hit._index === 'works')
				works.value.push({ ...hit._source, _id: hit._id })
            if (hit._index === 'publications')
                publications.value.push({ ...hit._source, _id: hit._id })
        })
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
}
</script>

<template>
	<NuxtLayout name="class">
		<section class="SearchContainer">
			<HTMLSearch v-model:value="search" :search="searchFunction" />
			<br />
			<article v-for="work in works" :key="work._id" class="Item">
				<NuxtLink :to="`trabajos/${work._id}`">
					<header>
						<h3>#Trabajo - {{ work.title }}</h3>
					</header>
				</NuxtLink>
				<pre v-if="work.description && work.description !== ''">
					{{ work.description }}
				</pre>
				<span>Fecha apertura: {{ formatDate(work.date_start) }}</span>
				<span>Fecha cierre: {{ formatDate(work.date_limit) }}</span>
				<footer>
					<small>
						Publicado por: <span class="Mark">{{ work.author }}</span>
					</small>
					<small>{{ formatDate(work.published) }}</small>
				</footer>
			</article>
			<article v-for="publication in publications" :key="publication._id" class="Item">
				<NuxtLink :to="`publicacion/${publication._id}`">
					<header>
						<h3>#Publicaci&oacute;n</h3>
					</header>
				</NuxtLink>
				<pre>{{ publication.content }}</pre>
				<footer>
					<small>
						Publicado por
						<span class="Mark">{{ publication.author }}</span>
					</small>
					<small>{{ formatDate(publication.published) }}</small>
				</footer>
			</article>
			
			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</section>
	</NuxtLayout>
</template>

<style scoped>

	.SearchContainer {
		margin: 20px;
		background-color: white;
		padding: 20px;
		border-radius: 15px;
		width: 100%;
		box-sizing: border-box;
		box-shadow: var(--box-shadow);
	}

	.Item {
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: 10px;
		box-sizing: border-box;
		border-bottom: 2px solid var(--color-light);
	}

	a {
		text-decoration: none;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	h3 {
		transition: all 0.4s;
	}

	.Item footer {
		margin-top: 15px;
		display: flex;
		justify-content: space-between;
	}

	.Mark {
		color: var(--color-main);
		font-weight: bold;
	}
</style>
