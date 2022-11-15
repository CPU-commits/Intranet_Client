<script lang="ts" setup>
// Types
import type { Author } from '~~/models/library/author.model'
import { urlify } from '~~/utils/format'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(
	schoolName ? `Autor - ${schoolName} - Intranet` : 'Autor - Intranet',
)

const { $fetchModule, $libraryService } = useNuxtApp()
const route = useRoute()

const authorParam = route.params.author
if (typeof authorParam !== 'string')
	throw createError({
		message: '[author] must be a string',
		statusCode: 400,
		fatal: true,
	})
// Data
const author = ref<Author | null>(null)
try {
	const dataFetch = await $libraryService.getAuthor(authorParam)

	author.value = dataFetch

	title.value = schoolName
		? `${author.value.name} - ${schoolName} - Intranet`
		: `${author.value.name} - Intranet`
} catch (err) {
	const _err = $fetchModule.handleError(err)
	throw createError({
		..._err,
		fatal: true,
	})
}

function copyLink() {
	navigator.clipboard.writeText(author.value?.slug ?? '')
}
</script>

<template>
	<section v-if="author" class="Author">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<section class="AuthorTop">
			<header>
				<h1>
					<span class="Button">
						<HTMLButtonIcon
							class-item="fa-solid fa-link"
							:click="copyLink"
						/>
					</span>
					{{ author.name }}
				</h1>
				<pre>{{ author.biography }}</pre>
			</header>
			<picture>
				<NuxtImg
					:src="author.image?.url"
					:alt="author.name"
					@error="$event.target.src = '/img/no_image.svg'"
				/>
				<HTMLTableSmall
					v-for="({ key, value }, i) in author.table_info"
					:key="i"
				>
					<tr>
						<td>{{ key }}</td>
						<td>{{ value }}</td>
					</tr>
				</HTMLTableSmall>
			</picture>
		</section>
		<h3>Datos curiosos</h3>
		<div v-for="(fact, i) in author.fun_facts" :key="i">
			<details :key="i">
				<summary>{{ fact.title }}</summary>
				<pre>{{ fact.fact }}</pre>
			</details>
		</div>
		<h3><i class="fa-solid fa-book-atlas" /> Referencias</h3>
		<ol v-for="(reference, i) in author.references" :key="i">
			<li>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<span v-html="urlify(reference)" />
			</li>
			<span v-if="author.references?.length === 0">
				Sin referencias...
			</span>
		</ol>
	</section>
</template>

<style scoped lang="scss">
.Author {
	margin: 20px;
	padding: 20px;
	background-color: white;
	border-radius: 15px;
	box-shadow: var(--box-shadow);
	box-sizing: border-box;
}

.AuthorTop {
	display: grid;
	grid-template-columns: 1fr 200px;
	gap: 20px;
}

header {
	width: 100%;
}

h1 {
	font-size: 1.7rem;
	display: flex;
	align-items: center;
	.Button {
		width: 30px;
	}
}

img {
	width: 200px;
	border: 2px solid var(--color-light);
	height: 200px;
	object-fit: cover;
}

h3 {
	margin-top: 10px;
}

details {
	padding: 8px;
}

pre {
	padding: 10px;
	border-bottom: 2px solid var(--color-light);
}

ol {
	padding: 15px;
}

// Media queries
@media (max-width: 767.98px) {
	.AuthorTop {
		grid-template-columns: 1fr 150px;
	}

	h1 {
		font-size: 1.4rem;
		.Button {
			width: 20px;
		}
	}

	h3 {
		font-size: 1rem;
	}

	pre,
	span {
		font-size: 0.9rem;
	}

	img {
		width: 150px;
		height: 150px;
	}
}

@media (max-width: 575.98px) {
	.Author {
		padding: 10px;
		margin: 10px;
		box-sizing: border-box;
	}

	.AuthorTop {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h1 {
		font-size: 1.1rem;
	}

	pre,
	span,
	summary,
	td {
		font-size: 0.8rem;
	}

	h3 {
		font-size: 0.9rem;
	}
}
</style>
