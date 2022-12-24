<script setup lang="ts">
// Types
import type { News } from '~~/models/news/news.model'
// Props
defineProps<{
	news: News
}>()
</script>

<template>
	<section class="News">
		<div class="News__contain">
			<header>
				<h1>{{ news.title }}</h1>
				<p>{{ news.headline }}</p>
				<span class="News__container--author">
					<span v-if="news.author?.name">
						{{ news.author.name }}
						{{ news.author.first_lastname }}
					</span>
					<span v-else>
						<i class="fa-solid fa-robot" /> Noticia
						autom&aacute;tica
					</span>
				</span>
			</header>
			<NuxtImg
				:src="news.image.url"
				:alt="news.title"
				fit="cover"
				@error="$event.target.src = '/img/no_image.svg'"
			/>
			<HTMLRich
				:have-background="false"
				:read-only="true"
				:body="news.body"
			/>
		</div>
	</section>
</template>

<style scoped>
.News {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30px;
	background-color: white;
	padding-bottom: 400px;
	border-left: 1px solid var(--color-light);
	border-right: 1px solid var(--color-light);
}

.News__contain {
	max-width: 650px;
	width: 100%;
}

h1,
p {
	width: 100%;
	padding-bottom: 10px;
}

img {
	width: 100%;
	max-height: 400px;
	margin-bottom: 30px;
	object-fit: cover;
}

.News__contain header {
	margin-bottom: 15px;
}

h1 {
	font-weight: 900;
	font-size: 2rem;
	font-size: 'Karla', sans-serif;
	padding-top: 50px;
	color: var(--color-news-black);
}

p {
	font-size: 1rem;
	border-bottom: 2px solid #ebebeb;
	margin-bottom: 25px;
}

.News__container--author,
.News__container--author i,
.News__container--author span {
	color: var(--color-main);
	font-weight: bold;
}

@media (max-width: 575.98px) {
	.News {
		padding: 10px;
	}

	h1 {
		padding-top: 10px;
		font-size: 2.2rem;
	}

	p {
		font-size: 0.9rem;
	}
}
</style>
