<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import type { Annoucement } from '~~/models/home/annoucement.model'
import type { News } from '~~/models/news/news.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import { formatMiniDate } from '~~/utils/format'
import onScroll from '~~/utils/onScroll'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Inicio - ${schoolName} - Intranet`
	: 'Inicio - Intranet'
// Nuxtapp
const { $fetchModule, $newsService, $homeService } = useNuxtApp()
// Stores
const auth = useAuthStore()

// Data
const annoucements = ref<Array<Annoucement> | null>(null)
const news = ref<Array<News> | null>(null)

const error = ref<ErrorFetch | null>(null)
const errorNews = ref<ErrorFetch | null>(null)
onMounted(async () => {
	const dataFetch = await Promise.allSettled([
		$newsService.getNews(3),
		getAnnoucements(true),
	])

	if (dataFetch[0].status === 'fulfilled')
		news.value = dataFetch[0].value.news
	else errorNews.value = $fetchModule.handleError(dataFetch[0].reason)

	if (dataFetch[1].status === 'fulfilled') {
		// Onscroll
		onScroll({
			total: dataFetch[1].value.total,
			max: 20,
			async fx(n) {
				try {
					await getAnnoucements(false, n)
					return n + 20
				} catch (err) {
					return n
				}
			},
		})
	} else {
		error.value = $fetchModule.handleError(dataFetch[1].reason)
	}
})

async function getAnnoucements(total = false, skip = 0, limit = 20) {
	const dataFetch = await $homeService.getAnnoucements(total, skip, limit)
	if (total || !annoucements.value)
		annoucements.value = dataFetch.annoucements
	else annoucements.value.push(...dataFetch.annoucements)
	return dataFetch
}

function newAnnoucement(annoucement: Annoucement) {
	if (annoucements.value)
		annoucements.value = [annoucement, ...annoucements.value]
}

function deleteAnnoucement(index: number) {
	if (annoucements.value) annoucements.value.splice(index, 1)
}
</script>

<template>
	<section class="Home">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<aside class="Home__last">
			<!-- eslint-disable vue/no-use-v-if-with-v-for -->
			<!-- eslint-disable vue/attributes-order -->
			<NuxtLink
				v-if="news"
				v-for="(_news, i) in news"
				:key="i"
				:to="`/noticias/${_news.url}`"
			>
				<article class="News">
					<header>
						<h2>{{ _news.title }}</h2>
						<NuxtImg
							:alt="_news.title"
							preload
							:src="_news.image.url"
							@error="$event.target.src = '/img/no_image.svg'"
						/>
					</header>
					<footer>
						<small>
							Publicado por:
							<span class="News__author">
								<span v-if="_news.author?.name">
									{{ _news.author.name }}
									{{ _news.author.first_lastname }}
								</span>
								<span v-else>
									<i class="fa-solid fa-robot" /> Noticia
									autom&aacute;tica
								</span>
							</span>
						</small>
						<small>{{ formatMiniDate(_news.upload_date) }}</small>
					</footer>
				</article>
			</NuxtLink>
			<Error v-else-if="errorNews" :err="errorNews" />
		</aside>
		<section class="Home__annoucements">
			<!-- eslint-disable vue/v-on-event-hyphenation -->
			<HomeAWrite
				v-if="
					auth.userTypeIs(
						UserTypesKeys.DIRECTIVE,
						UserTypesKeys.DIRECTOR,
					)
				"
				@newAnnoucement="(a) => newAnnoucement(a)"
			/>
			<div class="Home__annoucements--content">
				<LazyHomeAnnoucement
					v-for="(annoucement, i) in annoucements"
					:key="annoucement._id"
					:annoucement="annoucement"
					@delete="() => deleteAnnoucement(i)"
				/>
			</div>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</section>
	</section>
</template>

<style scoped>
a {
	text-decoration: none;
}

a:hover h2 {
	color: var(--color-main);
}

.Home__last {
	gap: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.News {
	background-color: white;
	box-shadow: var(--box-shadow);
	padding: 10px;
	border-radius: 8px;
	box-sizing: border-box;
}

.News h2 {
	font-size: 1.1rem;
	text-align: center;
	transition: all 0.4s;
	margin-bottom: 8px;
}

.News img {
	width: 100%;
}

.News footer {
	display: flex;
	flex-direction: column;
}

.News__author,
.News__author i {
	color: var(--color-main);
	font-weight: bold;
}

.Home {
	margin: 30px;
	display: grid;
	width: 100%;
	grid-template-columns: 180px 1fr;
	gap: 20px;
}

.Home__annoucements {
	background-color: white;
	box-shadow: var(--box-shadow);
	border-radius: 15px;
	padding: 15px;
	width: 100%;
}

.Home__annoucements--content {
	margin-top: 10px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

@media (max-width: 767.98px) {
	.Home {
		display: flex;
		margin: 15px;
	}

	.Home__last {
		display: none;
	}
}

@media (max-width: 575.98px) {
	.Home {
		margin: 8px;
	}
}
</style>
