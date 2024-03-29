<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Book } from '~~/models/library/book.model'
import type { BookFilters } from '~~/services/library.service'
import onScroll from '~~/utils/onScroll'
// Meta
definePageMeta({
	scrollToTop: true,
})

const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Biblioteca Virtual - ${schoolName} - Intranet`
	: 'Biblioteca Virtual - Intranet'
// Nuxtapp
const { $libraryService, $fetchModule } = useNuxtApp()

// Status
const saved = ref(false)
const filters = ref<BookFilters>({})
const search = ref('')

watch(saved, (newSaved) => {
	getBooks(true, 0, search.value, {
		...filters,
		saved: newSaved,
	})
})
watch(
	filters,
	(newFilters) => {
		getBooks(true, 0, search.value, {
			...newFilters,
			saved: saved.value,
		})
	},
	{ deep: true },
)
// Data
const books = ref<Array<Book> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	const dataFetch = await getBooks(true, 0)
	// Onscroll
	onScroll({
		total: dataFetch?.total ?? 0,
		max: 20,
		async fx(n) {
			const dataFetch = await getBooks(false, n, search.value, {
				...filters.value,
				saved: saved.value,
			})
			if (dataFetch !== undefined && books.value) {
				books.value.push(...dataFetch.books)
				return n + 20
			}
			return n
		},
	})
})

async function getBooks(
	total = false,
	skip?: number,
	search?: string,
	filters?: BookFilters,
) {
	try {
		const data = await $libraryService.getBooks(
			total,
			skip,
			search,
			filters,
		)

		if (total) books.value = data.books
		return data
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}

function saveBook(saveValue: boolean, index: number) {
	if (books.value) books.value[index].is_saved = saveValue
	if (!saveValue && saved.value && books.value) {
		books.value.splice(index, 1)
	}
}
</script>

<template>
	<section class="Library">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<LibMenu
			v-model:filters="filters"
			:books="books ?? []"
			:get-books="getBooks"
			:saved="saved"
		/>
		<section class="Books">
			<aside>
				<HTMLButton type="button" :click="() => (saved = !saved)">
					<i class="fa-solid fa-bookmark" /> Guardados
					<i v-if="saved" class="fa-solid fa-circle-xmark" />
				</HTMLButton>
			</aside>
			<!-- eslint-disable vue/no-use-v-if-with-v-for -->
			<!-- eslint-disable vue/attributes-order -->
			<LazyLibBook
				v-if="books"
				v-for="(book, i) in books"
				:key="book._id"
				:book="book"
				@save="(e: boolean) => saveBook(e, i)"
			/>
			<SpinnerGet />
			<section v-if="books && books.length === 0" class="Void">
				<img src="/img/fishing.svg" alt="Pescando" />
				<span>No se ha pescado ning&uacute;n libro</span>
			</section>
			<Error v-if="error" :err="error" />
		</section>
	</section>
</template>

<style scoped>
.Library {
	display: grid;
	grid-template-columns: 1fr 3.5fr;
	margin: 20px;
	height: 100%;
	gap: 20px;
	position: relative;
}

.Books {
	padding: 20px;
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	justify-content: center;
	align-items: center;
	border-radius: 15px;
	position: relative;
	margin-top: 20px;
}

aside {
	position: absolute;
	left: 0;
	top: -20px;
}

i {
	color: white;
}

.Void {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
}

.Void img {
	max-height: 300px;
}

@media (max-width: 767.98px) {
	.Library {
		grid-template-columns: 130px 5fr;
		margin: 15px;
		gap: 10px;
	}

	.Books {
		padding: 12px 0;
		gap: 15px;
	}
}

@media (max-width: 575.98px) {
	.Library {
		display: flex;
		flex-direction: column;
	}
}
</style>
