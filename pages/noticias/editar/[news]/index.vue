<script setup lang="ts">
// Types
import type { Editor } from '@tiptap/core';
import type { News } from '~~/models/news/news.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(schoolName
    ? `Noticia (editar) - ${schoolName} - Intranet`
    : 'Noticia (editar) - Intranet')
// Nuxtapp
const {
    $fetchModule,
    $newsService,
} = useNuxtApp()
// Stores
const toasts = useToastsStore()
// Router
const router = useRouter()
const route = useRoute()

const idNews = route.params.news
if (typeof idNews !== 'string')
    throw createError({
        message: '[news] must be a string',
        statusCode: 400,
        fatal: true,
    })

const news = ref<News | null>(null)
try {
    const dataFetch = await $newsService.getSingleNews(idNews)
    news.value = dataFetch

    title.value = schoolName
        ? `${news.value.title} (editar) - ${schoolName} - Intranet`
        : `${news.value.title} (editar) - Intranet`
} catch (err) {
    const _err = $fetchModule.handleError(err)
    throw createError({
        ..._err,
        fatal: true,
    })
}

// News
const fileInput = ref<HTMLInputElement | null>(null)
const editor = ref<Editor | null>(null)

// Functions
function onFileSelected(e: Event) {
    let image = e.target as HTMLInputElement
    if (!image.files || !image.files[0].type.includes('image')) {
        toasts.addToast({
            message: 'Debe seleccionar una imagen',
            type: 'error',
        })
        return
    }
    const reader = new FileReader()
    reader.readAsDataURL(image.files[0])
    reader.onload = (e) => {
        if (!news.value) return
        news.value.image.url = e.target?.result?.toString() ?? ''
    }
}

async function updateNews() {
    if (!news.value) return
    news.value.body = editor.value?.getHTML() ?? ''

    const updated = await $newsService.updateNews(
        news.value,
        fileInput.value?.files ?? null,
        news.value._id,
    )
    if (updated) router.push('/noticias')
}
</script>

<template>
    <section v-if="news" class="News">
        <Head>
            <Title>{{ title }}</Title>
        </Head>

        <div class="News__contain">
            <HTMLForm :form="updateNews">
                <input v-model="news.title" placeholder="Titulo" type="text" />
                <textarea v-model="news.headline" placeholder="Bajada" />
                <img
                    @click="() => fileInput?.click()"
                    title="Subir imagen"
                    :src="news.image.url"
                    alt="Subir imagen"
                />
                <input
                    @change="(e) => onFileSelected(e)"
                    ref="fileInput"
                    style="display:none"
                    accept=".jpg, .jpeg, .png"
                    type="file"
                />
                <HTMLRich
                    :body="news.body"
                    @build-editor="(e: Editor) => editor = e"
                    placeholder="Cuerpo..."
                    :have-background="false"
                />
                <button type="submit">Editar noticia </button>
            </HTMLForm>
        </div>
    </section>
</template>

<style scoped>
	.News {
		margin: 30px;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 400px;
	}

	.News__contain {
		max-width: 650px;
	}

	input,
	textarea {
		width: 100%;
		background: transparent;
		border: none;
		resize: none;
		padding-bottom: 10px;
	}

	img {
		width: 100%;
		max-height: 400px;
		object-fit: cover;
		cursor: pointer;
		margin-bottom: 30px;
	}

	button {
		margin-top: 20px;
		background: var(--color-news-black);
		color: white;
		padding: 10px 15px;
        border: none;
	}

	input:focus,
	textarea:focus {
		outline: none;
	}

	input {
		font-weight: 900;
		font-size: 2rem;
		font-size: 'Karla', sans-serif;
		word-spacing: -8px;
		padding-top: 50px;
		color: var(--color-news-black);
	}

	textarea {
		font-size: 1rem;
		border-bottom: 2px solid #ebebeb;
		margin-bottom: 25px;
	}

    @media (max-width: 575.98px) {
		.News {
			margin: 10px;
		}

		input:first-child {
			padding-top: 10px;
			font-size: 2.2rem;
		}
	}
</style>
