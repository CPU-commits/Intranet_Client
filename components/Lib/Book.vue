<script setup lang="ts">
// Types
import type { Author } from '~~/models/library/author.model'
import type { Book } from '~~/models/library/book.model'
import type { Editorial } from '~~/models/library/editorial.model'
import type { Tag } from '~~/models/library/tag.model'
// Nuxtapp
const { $libraryService } = useNuxtApp()

// Props
const props = defineProps<{
	book: Book
}>()

// Emits
const emits = defineEmits<{
	(e: 'save', save: boolean): void
}>()

async function saveBook() {
	const saved = await $libraryService.saveBook(props.book._id)
	if (saved) {
		if (props.book.is_saved !== undefined) {
			emits('save', !props.book.is_saved)
		} else {
			emits('save', true)
		}
	}
}
</script>

<template>
	<article class="Book">
		<NuxtLink :to="`/biblioteca/libro/${book.slug}`">
			<header>
				<h2>{{ book.name }}</h2>
				<NuxtImg
					:src="book.image.url"
					:alt="book.name"
					loading="lazy"
					preload
					@error="$event.target.src = '/img/no_image.svg'"
				/>
			</header>
		</NuxtLink>
		<section class="Ranking">
			<LibRating :stars="book.ranking ? book.ranking : 0" />
		</section>
		<footer>
			<section class="Tags">
				<i class="fa-solid fa-tags" />
				<small v-for="(tag, i) in (book.tags as Array<Tag>)" :key="i">
					{{ tag.tag }} {{ i + 1 !== book.tags.length ? '-' : '' }}
				</small>
			</section>
			<small>
				Autor:
				<span class="Author">
					{{ (book.author as Author).name }}
				</span>
			</small>
			<small>
				<i title="Publicador/editorial" class="fa-solid fa-bullhorn" />
				{{ (book.editorial as Editorial).editorial }}
			</small>
		</footer>
		<aside>
			<HTMLButtonIcon
				:selected="book.is_saved"
				class-item="fa-solid fa-bookmark"
				:click="saveBook"
			/>
		</aside>
	</article>
</template>

<style scoped>
a {
	text-decoration: none;
}

.dark-mode .Book {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Book {
	box-shadow: var(--box-shadow);
}

.Book {
	background-color: white;
	max-width: 250px;
	width: 100%;
	padding: 15px;
	border-radius: 8px;
	position: relative;
	transition: all 0.4s;
}

.Book:hover {
	box-shadow: none;
}

header {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

header img {
	height: 250px;
	width: 180px;
	align-self: center;
	border: 2px solid var(--color-light);
	object-fit: cover;
}

.Tags {
	display: flex;
	align-items: center;
	gap: 5px;
	flex-wrap: wrap;
}

i {
	color: var(--color-main);
}

.Ranking {
	display: flex;
	margin-top: 10px;
	justify-content: center;
}

footer {
	margin-top: 10px;
	display: flex;
	flex-direction: column;
}

.Author {
	color: var(--color-main);
	font-weight: bold;
}

aside {
	position: absolute;
	right: 10px;
	bottom: 10px;
}

@media (max-width: 767.98px) {
	.Book {
		max-width: 160px;
		padding: 10px;
		border-radius: 5px;
	}

	header img {
		height: 170px;
		width: 100%;
	}

	small {
		font-size: 0.75rem;
	}
}

@media (max-width: 575.98px) {
	.Book {
		max-width: 250px;
	}

	header img {
		height: 200px;
		width: 180px;
	}

	small {
		font-size: 0.7rem;
	}
}
</style>
