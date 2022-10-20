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
    ) => Promise<{
        total: number
        books: Array<Book>
    } | undefined>
    saved: boolean
}>()

const isSaved = toRef(props, 'saved')
// Emits
const emits = defineEmits<{
    (e: 'update:search', searchf: string): void,
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
</script>

<template>
    <nav class="Filter">
        <h4><i class="fa-solid fa-filter" /> Filtros</h4>
        <HTMLSearch
            placeholder="Palabra clave"
            v-model:value="search"
            :search="() => getBooks(true, 0, search, {
                ...filters,
                saved: isSaved,
            })"
        />
        <div>
            <h5>Alfab&eacute;tico</h5>
            <HTMLButtonIcon
                :selected="filters.alphebet === 'asc'"
                :oneHundred="false"
                :click="() => filters.alphebet = 'asc'"
                classItem="fa-solid fa-arrow-down-a-z"
            />
            <HTMLButtonIcon
                :selected="filters.alphebet === 'desc'"
                :oneHundred="false"
                :click="() => filters.alphebet = 'desc'"
                classItem="fa-solid fa-arrow-up-a-z"
            />
        </div>
        <div class="Filter__stars">
            <h5>Clasificaci&oacute;n</h5>
            <article class="Stars">
                <input type="radio" value="5" v-model="filters.ranking" @click="() => filters.ranking = '5'" />
                <i v-for="_ in 5" class="fa-solid fa-star" />
            </article>
            <article class="Stars">
                <input type="radio" value="4" v-model="filters.ranking" @click="() => filters.ranking = '4'" />
                <i v-for="_ in 4" class="fa-solid fa-star" />
            </article>
            <article class="Stars">
                <input type="radio" value="3" v-model="filters.ranking" @click="() => filters.ranking = '3'" />
                <i v-for="_ in 3" class="fa-solid fa-star" />
            </article>
            <article class="Stars">
                <input type="radio" value="2" v-model="filters.ranking" @click="() => filters.ranking = '2'" />
                <i v-for="_ in 2" class="fa-solid fa-star" />
            </article>
            <article class="Stars">
                <input type="radio" value="1" v-model="filters.ranking" @click="() => filters.ranking = '1'" />
                <i class="fa-solid fa-star" />
            </article>
            <div class="Dissmiss">
                <HTMLButtonText
                    :click="() => {
                        filters.ranking = ''
                    }"
                >
                    <i class="fa-solid fa-delete-left" /> Desmarcar
                </HTMLButtonText>
            </div>
        </div>
        <div>
            <h5>Fecha de Añadido</h5>
            <HTMLButtonIcon
                :selected="filters.added === 'desc'"
                :click="() => filters.added = 'desc'"
                classItem="fa-solid fa-arrow-down-wide-short"
                :oneHundred="false"
            />
            <HTMLButtonIcon
                :selected="filters.added === 'asc'"
                :click="() => filters.added = 'asc'"
                classItem="fa-solid fa-arrow-up-wide-short"
                :oneHundred="false"
            />
        </div>
        <label for="author">Autor</label>
        <HTMLSelect id="author" v-model:value="filters.author">
            <option value="">Cualquier autor</option>
            <option v-for="(author, i) in authors" :value="author._id" :key="i">
                {{ author.name }}
            </option>
        </HTMLSelect>
        <label for="category">Categor&iacute;a</label>
        <HTMLSelect id="category" v-model:value="filters.category">
            <option value="">Cualquier categor&iacute;a</option>
            <option v-for="(tag, i) in tags" :value="tag._id" :key="i">
                {{ tag.tag }}
            </option>
        </HTMLSelect>
        <label for="editorial">Editorial/publicador</label>
        <HTMLSelect id="editorial" v-model:value="filters.editorial">
            <option value="">Cualquier editorial/publicador</option>
            <option v-for="(editorial, i) in editorials" :value="editorial._id" :key="i">
                {{ editorial.editorial }}
            </option>
        </HTMLSelect>
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
</style>
