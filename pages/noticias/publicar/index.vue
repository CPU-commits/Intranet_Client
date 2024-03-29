<script setup lang="ts">
// Types
import type { Editor } from '@tiptap/core'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Publicar noticia - ${schoolName} - Intranet`
	: 'Publicar noticia - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.DIRECTIVE,
		UserTypesKeys.STUDENT_DIRECTIVE,
		UserTypesKeys.DIRECTOR,
	],
})
// Nuxtapp
const { $newsService } = useNuxtApp()
// Stores
const toasts = useToastsStore()
// Router
const router = useRouter()

// Form
const news = reactive({
	title: '',
	headline: '',
	body: '',
})
const src = ref('/img/news.svg')
const fileInput = ref<HTMLInputElement | null>(null)
const editor = ref<Editor | null>(null)

// Functions
function onFileSelected(e: Event) {
	const image = e.target as HTMLInputElement
	if (!image.files || !image.files[0].type.includes('image')) {
		toasts.addToast({
			message: 'Debe seleccionar una imagen',
			type: 'error',
		})
		return
	}
	const reader = new FileReader()
	reader.readAsDataURL(image.files[0])
	reader.onload = () => {
		src.value = reader.result?.toString() ?? ''
	}
}

async function publishNews() {
	if (editor.value) news.body = editor.value.getHTML()
	const uploaded = await $newsService.publishNews(
		news,
		fileInput.value?.files ?? null,
	)
	if (uploaded) router.push('/noticias')
}
</script>

<template>
	<section class="News">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<div class="News__contain">
			<HTMLForm :form="publishNews">
				<img
					:src="src"
					title="Subir imagen"
					alt="Subir imagen"
					@click="() => fileInput?.click()"
				/>
				<input v-model="news.title" placeholder="Titulo" type="text" />
				<textarea v-model="news.headline" placeholder="Bajada" />
				<input
					ref="fileInput"
					style="display: none"
					accept=".jpg, .jpeg, .png"
					type="file"
					@change="(e) => onFileSelected(e)"
				/>
				<HTMLRich
					:have-background="false"
					@build-editor="(e: Editor) => editor = e"
				/>
				<button type="submit">Publicar noticia</button>
			</HTMLForm>
		</div>
	</section>
</template>

<style scoped>
.News {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30px;
	padding-bottom: 400px;
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
	border-radius: 10px;
}

button {
	margin-top: 20px;
	background: var(--color-news-black);
	color: white;
	border: none;
	padding: 10px 15px;
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
