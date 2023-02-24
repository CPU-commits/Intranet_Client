<!-- eslint-disable vue/no-mutating-props -->
<script setup lang="ts">
// Types
import type { News, NewsType } from '~~/models/news/news.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { timeAgo } from '~~/utils/format'
// Props
const props = defineProps<{
	news: News
	type: keyof typeof NewsType
}>()
// Nuxtapp
const { $newsService } = useNuxtApp()
// Stores
const auth = useAuthStore()

// Emits
const emits = defineEmits<{
	(e: 'delete', v: void): void
}>()
// Modal
const openMenu = ref(false)
const modal = ref(false)

function toogleLike() {
	if (!props.news.like) {
		props.news.likes++
	} else {
		props.news.likes--
	}
	props.news.like = !props.news.like
}

async function likeNews() {
	toogleLike()
	const liked = await $newsService.likeNews(props.news.like, props.news._id)
	if (!liked) toogleLike()
}

async function deleteNews() {
	modal.value = false
	const deleted = await $newsService.deleteNews(props.news._id)
	if (deleted) emits('delete')
}
</script>

<template>
	<article bind:this="{newsElement}" class="News">
		<div
			v-if="
				(news.type === 'global' &&
					type === 'global' &&
					auth.userTypeIs(
						UserTypesKeys.DIRECTOR,
						UserTypesKeys.DIRECTIVE,
					)) ||
				(news.type === 'student' &&
					type === 'student' &&
					auth.userTypeIs(UserTypesKeys.STUDENT_DIRECTIVE))
			"
			class="News__config"
		>
			<button
				@click="
					() => {
						openMenu = !openMenu
					}
				"
			>
				<i class="fa-solid fa-ellipsis-vertical" />
			</button>
			<div
				:class="openMenu ? 'News__config--open' : ''"
				class="News__config--container"
			>
				<NuxtLink :to="`/noticias/editar/${news.url}`">
					<i class="fa-solid fa-pen-to-square" /> Editar
				</NuxtLink>
				<button
					@click="
						() => {
							modal = true
							openMenu = !openMenu
						}
					"
				>
					<i class="fa-solid fa-trash-can" /> Eliminar
				</button>
			</div>
		</div>

		<NuxtLink class="News__content" :to="`/noticias/${news.url}`">
			<section class="News__text">
				<div>
					<h3>{{ news.title }}</h3>
					<p>{{ news.headline }}</p>
				</div>
			</section>
			<NuxtImg
				:src="news.image.url"
				:alt="news.title"
				loading="lazy"
				preload
				@error="$event.target.src = '/img/no_image.svg'"
			/>
		</NuxtLink>
		<footer class="News__details">
			<button @click="likeNews">
				<i
					:class="news.like ? 'LikeAnimation' : ''"
					class="fa-solid fa-heart"
				/>
			</button>
			<span>{{ news.likes }}</span>
			<span>
				Escrito:
				<span v-if="news.author?.name">
					{{ news.author.name }}
					{{ news.author.first_lastname }}
				</span>
				<span v-else>
					<i class="fa-solid fa-robot" /> Noticia autom&aacute;tica
				</span>
			</span>
		</footer>
		<small>{{ timeAgo(news.upload_date) }}</small>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h3>Eliminar noticia</h3>
			</template>
			<section class="Modal">
				<h4>¿Est&aacute; seguro de eliminar la noticia?</h4>
				<div class="Modal__buttons">
					<button @click="deleteNews">S&iacute;, eliminar</button>
					<button @click="() => (modal = false)">No, cancelar</button>
				</div>
			</section>
		</Modal>
	</article>
</template>

<style lang="scss" scoped>
.News {
	width: 100%;
	max-width: 600px;
	border-top: 1px solid var(--color-news-black);
	border-bottom: 1px solid var(--color-news-black);
	position: relative;
}

.News__config {
	position: absolute;
	right: 5px;
	top: 5px;
}

.News__config--container {
	position: absolute;
	background-color: white;
	top: 0;
	right: 10px;
	padding: 5px 10px;
	z-index: 4;
	border: 1px solid var(--color-light);
	display: none;
}

.News__config--open {
	display: block;
}

.News__config--container button,
.News__config--container a {
	padding: 3px 0;
	width: 100%;
	display: flex;
	gap: 5px;
	transition: all 0.4s;
	font-size: 0.8rem;
	text-decoration: none;
	i {
		transition: all 0.4s;
	}
}

.News__config--container a:first-child:hover {
	color: var(--color-news);
	i {
		color: var(--color-news);
	}
}

.News__config--container button:last-child:hover {
	color: var(--color-danger);
	i {
		color: var(--color-danger);
	}
}

h4 {
	text-align: center;
	margin-bottom: 20px;
}

.Modal__buttons {
	display: flex;
	justify-content: center;
}

.Modal button {
	padding: 20px;
}

.Modal button:first-child {
	color: var(--color-danger);
}

.News__text {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	margin-bottom: 10px;
}

.News__content {
	text-decoration: none;
	width: 100%;
	margin: 20px;
	box-sizing: border-box;
	position: relative;
	display: flex;
	justify-content: space-between;
	position: relative;
}

.News__content:hover h3 {
	color: var(--color-news);
}

h3 {
	font-size: 1.3rem;
	margin-bottom: 10px;
	transition: all 0.4s;
}

h3:hover {
	color: var(--color-news);
}

p {
	font-size: 0.9rem;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

img {
	width: 150px;
	height: 90px;
	object-fit: cover;
}

footer {
	position: absolute;
	left: 20px;
	bottom: 5px;
	font-size: 0.8rem;
}

small {
	position: absolute;
	right: 5px;
	bottom: 5px;
	font-size: 0.7rem;
}

button {
	border: none;
	background-color: transparent;
}

i {
	cursor: pointer;
}

.LikeAnimation {
	color: var(--color-danger);
	animation: Like 0.5s;
}

@keyframes Like {
	from {
		transform: scale(0);
	}

	50% {
		transform: scale(1.2);
	}

	from {
		transform: scale(0);
	}
}

@media (max-width: 767.98px) {
	.News a {
		margin: 15px;
		margin-bottom: 20px;
	}

	h3 {
		font-size: 1.2rem;
	}

	p {
		font-size: 0.9rem;
	}

	.News__details {
		font-size: 0.75rem;
	}

	small {
		font-size: 0.7rem;
		bottom: 3px;
	}
}

@media (max-width: 575.98px) {
	.News a {
		margin: 5px;
		margin-bottom: 20px;
	}

	h3 {
		font-size: 1rem;
	}

	p {
		font-size: 0.75rem;
	}

	img {
		width: 120px;
		height: 70px;
	}

	.News__details {
		font-size: 0.7rem;
		left: 0;
		i {
			font-size: 0.6rem;
			margin-right: 2px;
		}
	}

	small {
		font-size: 0.6rem;
		right: 0;
	}

	.News__config {
		top: 0;
		right: 0;
	}
}
</style>
