<script setup lang="ts">
// Types
import type { Author } from '~~/models/library/author.model'
import type { Book } from '~~/models/library/book.model'
import type { Editorial } from '~~/models/library/editorial.model'
import type { Tag } from '~~/models/library/tag.model'
import type { BookFilters } from '~~/services/library.service'
// Nuxtapp
const { $libraryService, $fetchModule } = useNuxtApp()
// Stores
const toasts = useToastsStore()

// Props
const props = defineProps<{
	getBooks: (
		total?: boolean,
		skip?: number,
		search?: string,
		filters?: BookFilters,
	) => Promise<
		| {
				total: number
				books: Array<Book>
		  }
		| undefined
	>
	saved: boolean
}>()

const isSaved = toRef(props, 'saved')
// Emits
const emits = defineEmits<{
	(e: 'update:search', searchf: string): void
	(e: 'update:filters', filtersf: BookFilters): void
}>()
// Status
const search = ref('')
const filters: BookFilters = reactive({
	alphebet: 'asc',
})

watch(search, () => {
	emits('update:search', search.value)
})
watch(filters, () => {
	emits('update:filters', filters)
})
// Data
const authors = ref<Array<Author>>([])
const tags = ref<Array<Tag>>([])
const editorials = ref<Array<Editorial>>([])

onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$libraryService.getAuthors(),
			$libraryService.getTags(),
			$libraryService.getEditorials(),
		])

		authors.value = dataFetch[0]
		tags.value = dataFetch[1]
		editorials.value = dataFetch[2]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		toasts.addToast({
			message: _err.message,
			type: 'error',
		})
	}
})

const filtersOpen = ref(false)
function openFilters() {
	filtersOpen.value = !filtersOpen.value
}
</script>

<template>
	<nav class="Filter">
		<h4 @click="openFilters"><i class="fa-solid fa-filter" /> Filtros</h4>
		<section class="Filter__content" :class="{ Filter__open: filtersOpen }">
			<HTMLSearch
				v-model:value="search"
				placeholder="Palabra clave"
				:search="
					() =>
						getBooks(true, 0, search, {
							...filters,
							saved: isSaved,
						})
				"
			/>
			<div>
				<h5>Alfab&eacute;tico</h5>
				<HTMLButtonIcon
					:selected="filters.alphebet === 'asc'"
					:one-hundred="false"
					:click="() => (filters.alphebet = 'asc')"
					class-item="fa-solid fa-arrow-down-a-z"
				/>
				<HTMLButtonIcon
					:selected="filters.alphebet === 'desc'"
					:one-hundred="false"
					:click="() => (filters.alphebet = 'desc')"
					class-item="fa-solid fa-arrow-up-a-z"
				/>
			</div>
			<div class="Filter__stars">
				<h5>Clasificaci&oacute;n</h5>
				<article class="Stars">
					<input
						v-model="filters.ranking"
						type="radio"
						value="5"
						@click="() => (filters.ranking = '5')"
					/>
					<i v-for="i in 5" :key="i" class="fa-solid fa-star" />
				</article>
				<article class="Stars">
					<input
						v-model="filters.ranking"
						type="radio"
						value="4"
						@click="() => (filters.ranking = '4')"
					/>
					<i v-for="i in 4" :key="i" class="fa-solid fa-star" />
				</article>
				<article class="Stars">
					<input
						v-model="filters.ranking"
						type="radio"
						value="3"
						@click="() => (filters.ranking = '3')"
					/>
					<i v-for="i in 3" :key="i" class="fa-solid fa-star" />
				</article>
				<article class="Stars">
					<input
						v-model="filters.ranking"
						type="radio"
						value="2"
						@click="() => (filters.ranking = '2')"
					/>
					<i v-for="i in 2" :key="i" class="fa-solid fa-star" />
				</article>
				<article class="Stars">
					<input
						v-model="filters.ranking"
						type="radio"
						value="1"
						@click="() => (filters.ranking = '1')"
					/>
					<i class="fa-solid fa-star" />
				</article>
				<div class="Dissmiss">
					<HTMLButtonText
						:click="
							() => {
								filters.ranking = ''
							}
						"
					>
						<i class="fa-solid fa-delete-left" /> Desmarcar
					</HTMLButtonText>
				</div>
			</div>
			<div>
				<h5>Fecha de Añadido</h5>
				<HTMLButtonIcon
					:selected="filters.added === 'desc'"
					:click="() => (filters.added = 'desc')"
					class-item="fa-solid fa-arrow-down-wide-short"
					:one-hundred="false"
				/>
				<HTMLButtonIcon
					:selected="filters.added === 'asc'"
					:click="() => (filters.added = 'asc')"
					class-item="fa-solid fa-arrow-up-wide-short"
					:one-hundred="false"
				/>
			</div>
			<label for="author">Autor</label>
			<HTMLSelect id="author" v-model:value="filters.author">
				<option value="">Cualquier autor</option>
				<option
					v-for="(author, i) in authors"
					:key="i"
					:value="author._id"
				>
					{{ author.name }}
				</option>
			</HTMLSelect>
			<label for="category">Categor&iacute;a</label>
			<HTMLSelect id="category" v-model:value="filters.category">
				<option value="">Cualquier categor&iacute;a</option>
				<option v-for="(tag, i) in tags" :key="i" :value="tag._id">
					{{ tag.tag }}
				</option>
			</HTMLSelect>
			<label for="editorial">Editorial/publicador</label>
			<HTMLSelect id="editorial" v-model:value="filters.editorial">
				<option value="">Cualquier editorial/publicador</option>
				<option
					v-for="(editorial, i) in editorials"
					:key="i"
					:value="editorial._id"
				>
					{{ editorial.editorial }}
				</option>
			</HTMLSelect>
		</section>
	</nav>
</template>

<style scoped>
.Filter {
	display: flex;
	position: sticky;
	top: 20px;
	height: fit-content;
	flex-direction: column;
	gap: 10px;
}

.Filter__content {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.Filter__stars {
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.Stars {
	display: flex;
	width: fit-content;
	gap: 2px;
}

.Stars i {
	font-size: 10px;
}

.Dissmiss {
	width: fit-content;
}

@media (max-width: 767.98px) {
	h5 {
		font-size: 0.8rem;
	}

	label {
		font-size: 0.9rem;
	}

	button {
		padding: 5px;
		font-size: 0.95rem;
	}
}

@media (max-width: 575.98px) {
	.Filter {
		top: 0;
		position: relative;
	}

	.Filter__content {
		display: none;
	}

	.Filter__open {
		display: block;
	}

	h5 {
		font-size: 0.7rem;
	}

	label {
		font-size: 0.8rem;
	}

	button {
		padding: 5px;
		font-size: 0.9rem;
	}
}
</style>
