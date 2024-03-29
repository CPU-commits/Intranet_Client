<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { News } from '~~/models/news/news.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import onScroll from '~~/utils/onScroll'
// Meta
definePageMeta({
	scrollToTop: true,
})

const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Noticias - ${schoolName} - Intranet`
	: 'Noticias - Intranet'
// Nuxtapp
const { $fetchModule, $newsService } = useNuxtApp()
// Stores
const auth = useAuthStore()

// Data
const news = ref<Array<News> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	const dataFetch = await getNews(true)
	if (dataFetch !== undefined)
		onScroll({
			max: 10,
			total: dataFetch.total,
			async fx(n) {
				const dataFetch = await getNews(false, n)
				if (dataFetch !== undefined) return n + 10
				return n
			},
		})
})

async function getNews(total = false, skip?: number) {
	try {
		const dataFetch = await $newsService.getNews(undefined, total, skip)
		if (total || !news.value) news.value = dataFetch.news
		else news.value.push(...dataFetch.news)
		return dataFetch
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
}

function deleteNews(index: number) {
	news.value?.splice(index, 1)
}
</script>

<template>
	<section class="News">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<ul
			v-if="
				auth.userTypeIs(
					UserTypesKeys.STUDENT,
					UserTypesKeys.STUDENT_DIRECTIVE,
				)
			"
			class="News__type"
		>
			<li>
				<NuxtLink class="News__type--use" to="/noticias">
					General
				</NuxtLink>
			</li>
			<li>
				<NuxtLink to="/noticias/estudiantes"> Estudiantes </NuxtLink>
			</li>
		</ul>
		<!-- eslint-disable vue/attributes-order -->
		<LazyNews
			v-if="news"
			v-for="(_news, i) in news"
			:key="_news._id"
			type="global"
			:news="_news"
			@delete="() => deleteNews(i)"
		/>
		<h3 v-if="news && news.length === 0">Sin noticias...</h3>

		<SpinnerGet />
		<Error v-if="error" :err="error" />

		<button
			v-if="
				auth.userTypeIs(
					UserTypesKeys.DIRECTIVE,
					UserTypesKeys.DIRECTOR,
					UserTypesKeys.STUDENT_DIRECTIVE,
				)
			"
		>
			<NuxtLink to="/noticias/publicar">
				<aside class="AddNews">
					<i class="fa-solid fa-plus" />
				</aside>
			</NuxtLink>
		</button>
	</section>
</template>

<style lang="scss" scoped>
.News {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 30px;
	box-sizing: border-box;
	gap: 40px;
}

.News__type {
	display: flex;
	gap: 20px;
	list-style: none;
}

.News__type a {
	text-decoration: none;
	font-size: 0.9rem;
	transition: all 0.4s;
}

.News__type a:hover {
	color: var(--color-news);
}

.News__type--use {
	color: var(--color-news);
}

.AddNews {
	position: fixed;
	bottom: 20px;
	right: 20px;
	background-color: var(--color-news);
	height: 50px;
	width: 50px;
	border-radius: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	i {
		color: var(--color-news--black);
	}
}

.page-enter-active,
.page-leave-active {
	transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
	opacity: 0;
	filter: blur(1rem);
}

@media (max-width: 767.98px) {
	.News {
		padding: 20px;
	}

	.AddNews {
		width: 40px;
		height: 40px;
		bottom: 10px;
		right: 10px;
	}
}

@media (max-width: 575.98px) {
	.News {
		padding: 10px;
		gap: 20px;
	}

	.AddNews {
		width: 35px;
		height: 35px;
		bottom: 10px;
		right: 10px;
		i {
			font-size: 0.8rem;
		}
	}
}
</style>
