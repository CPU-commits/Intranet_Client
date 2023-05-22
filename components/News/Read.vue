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
				<NuxtImg
					:src="news.image.url"
					:alt="news.title"
					fit="cover"
					@error="$event.target.src = '/img/no_image.svg'"
				/>
				<h1>{{ news.title }}</h1>
				<footer class="Footer">
					<strong>{{ news.headline }}</strong>
					<small>{{ formatDate(news.upload_date) }}</small>
					<span class="News__container--author">
						<span v-if="news.author?.name">
							Escrito por
							{{ news.author.name }}
							{{ news.author.first_lastname }}
						</span>
						<span v-else>
							<i class="fa-solid fa-robot" /> Noticia
							autom&aacute;tica
						</span>
					</span>
				</footer>
			</header>
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
	padding-top: 15px;
	padding-bottom: 400px;
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
	max-width: 500px;
	object-fit: cover;
	border-radius: 10px;
}

.News__contain header {
	margin-bottom: 15px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

h1 {
	font-weight: 900;
	font-size: 2rem;
	padding-top: 20px;
	color: var(--color-news-black);
}

.Footer {
	border-bottom: 2px solid #ebebeb;
	width: 100%;
	display: flex;
	flex-direction: column;
	padding: 10px 0;
	gap: 5px;
}

p {
	font-size: 1rem;
	margin-bottom: 25px;
}

.News__container--author,
.News__container--author i,
.News__container--author span {
	font-weight: bold;
	font-style: italic;
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
