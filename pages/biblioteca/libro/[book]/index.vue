<script setup lang="ts">
// Types
import type { Book } from '~~/models/library/book.model'
import type { Tag } from '~~/models/library/tag.model'
import type { Author } from '~~/models/library/author.model'
import type { Editorial } from '~~/models/library/editorial.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(schoolName
    ? `Libro - ${schoolName} - Intranet`
    : 'Libro - Intranet')
// Nuxtp
const {
    $fetchModule,
    $libraryService,
    $filesService,
} = useNuxtApp()
// Router
const route = useRoute()

const idBook = route.params.book
if (typeof idBook !== 'string')
    throw createError({
        message: '[book] must be a string',
        statusCode: 400,
        fatal: true,
    })
// Data
const book = ref<Book | null>(null)
try {
    const dataFetch = await $libraryService.getBook(idBook)
    book.value = dataFetch

    title.value = schoolName
        ? `${book.value.name} - ${schoolName} - Intranet`
        : `${book.value.name} - Intranet`
} catch (err) {
    const _err = $fetchModule.handleError(err)
    throw createError({
        ..._err,
        fatal: true,
    })
}

const opinion = ref ('')

function downloadBook() {
    if (book.value && book.value.book)
        $filesService.downloadFileUrl(book.value.book.url)
}
</script>

<template>
    <section v-if="book" class="Book">
        <Head>
            <Title>{{ title }}</Title>
        </Head>

        <section class="Header">
            <figure class="Header__image">
                <img :src="book.image.url" :alt="book.name" />
                <LibRating :stars="book.ranking ? book.ranking : 0" />
                <a target="_blank" :href="`/biblioteca/autor/${(book.author as Author).slug}`">
                    Autor: <span class="Author">{{ (book.author as Author).name }}</span>
                </a>
                <section class="Tags">
                    <i class="fa-solid fa-tags" />
                    <small v-for="(tag, i) in (book.tags as Array<Tag>)" :key="i">
                        {{ tag.tag }}
                        {{ i + 1 !== book.tags.length ? '-' : '' }}
                    </small>
                </section>
            </figure>
            <article class="Header__essentials">
                <h1>{{ book.name }}</h1>
                <pre>{{ book.synopsis }}</pre>
                <div class="BookFile">
                    <HTMLButton type="button" :click="downloadBook">
                        <i class="fa-solid fa-file-arrow-down" />
                        Descargar libro
                    </HTMLButton>
                </div>
                <h3>¿Qu&eacute; te parece {{ book.name }}?</h3>
                <div class="Rating">
                    <input
                        v-model="opinion"
                        @change="() =>
                            $libraryService.uploadRanking(opinion, book?._id ?? '')"
                        value="5"
                        type="radio"
                        name="rate"
                        id="rate-5"
                    />
                    <label class="fas fa-star" for="rate-5" />
                    <input
                        v-model="opinion"
                        @change="() =>
                            $libraryService.uploadRanking(opinion, book?._id ?? '')"
                        value="4"
                        type="radio"
                        name="rate"
                        id="rate-4"
                    />
                    <label class="fas fa-star" for="rate-4" />
                    <input
                        v-model="opinion"
                        @change="() =>
                            $libraryService.uploadRanking(opinion, book?._id ?? '')"
                        value="3"
                        type="radio"
                        name="rate"
                        id="rate-3"
                    />
                    <label class="fas fa-star" for="rate-3" />
                    <input
                        v-model="opinion"
                        @change="() =>
                            $libraryService.uploadRanking(opinion, book?._id ?? '')"
                        value="2"
                        type="radio"
                        name="rate"
                        id="rate-2"
                    />
                    <label class="fas fa-star" for="rate-2" />
                    <input
                        v-model="opinion"
                        @change="() =>
                            $libraryService.uploadRanking(opinion, book?._id ?? '')"
                        value="1"
                        type="radio"
                        name="rate"
                        id="rate-1"
                    />
                    <label class="fas fa-star" for="rate-1" />
                </div>
            </article>
        </section>
        <footer>
            <NuxtImg
                :src="(book.editorial as Editorial).image.url"
                :alt="(book.editorial as Editorial).editorial"
            />
            <h5>Editorial</h5>
        </footer>
    </section>
</template>

<style scoped>
	.Book {
		background-color: white;
		margin: 20px;
		border-radius: 15px;
		box-shadow: var(--box-shadow);
		padding: 15px;
	}

	h1 {
		font-size: 1.6rem;
	}

    h3 {
        text-align: center;
    }

	pre {
		white-space: normal;
		border-bottom: 2px solid var(--color-light);
		padding: 10px;
	}

	.Header {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: 20px;
		margin-top: 20px;
	}

	.BookFile {
		width: fit-content;
	}

	a {
		text-decoration: none;
	}

	.Author {
		color: var(--color-main);
	}

	.Header__essentials {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.Header__image {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	i {
		color: white;
	}

	.Tags {
		display: flex;
		align-items: center;
		gap: 5px;
		flex-wrap: wrap;
	}

	.Tags i {
		color: var(--color-main);
	}

	figure img {
		width: 250px;
		height: 300px;
		object-fit: cover;
		border: 2px solid var(--color-light);
	}

	footer {
		border-top: 2px solid var(--color-light);
		width: 100%;
		margin-top: 10px;
		flex-direction: column;
		align-items: center;
		padding: 5px;
		display: flex;
		justify-content: center;
	}

	footer img {
		max-width: 200px;
		height: 100px;
		object-fit: cover;
		filter: grayscale(1);
	}

	.Rating {
		display: flex;
		flex-direction: row-reverse;
        justify-content: center;
	}

	.Rating input {
		display: none;
	}

	.Rating label {
		font-size: 20px;
		color: #444;
		padding: 5px;
		float: right;
		transition: all 0.2s ease;
	}

	.Rating input:not(:checked) ~ label:hover,
	.Rating input:not(:checked) ~ label:hover ~ label {
		color: #fd4;
	}

	.Rating input:checked ~ label {
		color: #fd4;
	}

    @media (max-width: 767.98px) {
        .Book {
            margin: 10px;
            padding: 10px;
        }

        .Header {
            grid-template-columns: 150px 1fr;
        }

        h1 {
            font-size: 1.2rem;
        }

        h3 {
            font-size: 1rem;
        }

        pre, a {
            font-size: 0.9rem;
        }

        figure img {
            width: 150px;
            height: 100%;
        }

        .Rating label {
            font-size: 1.1rem;
        }
    }

    @media (max-width: 575.98px) {
        .Book {
            padding: 5px;
        }

        .Header {
            margin-top: 5px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .Header__image {
            gap: 5px;
        }

        .Header__essentials {
            gap: 10px;
        }

        h1 {
            font-size: 1.1rem;
        }

        h3 {
            font-size: 0.9rem;
        }

        pre, a {
            font-size: 0.8rem;
        }

        .Rating label {
            font-size: 1rem;
        }
    }
</style>
