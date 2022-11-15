<script setup lang="ts">
// Types
import type { Book } from '~~/models/library/book.model'
import type { Tag } from '~~/models/library/tag.model'
import type { Author } from '~~/models/library/author.model'
import type { Editorial } from '~~/models/library/editorial.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Nuevo Libro - Biblioteca Virtual - Admin - ${schoolName} - Intranet`
	: 'Nuevo Libro - Biblioteca Virtual - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.DIRECTIVE,
		UserTypesKeys.DIRECTOR,
		UserTypesKeys.LIBRARIAN,
	],
})
// Stores
const toasts = useToastsStore()
// Nuxt app
const { $libraryService, $fetchModule } = useNuxtApp()
// Router
const router = useRouter()

// Modal
const modal = ref(false)
// Form
const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<FileList | null>(null)
const src = ref('/img/image.svg')
const book: Omit<
	Omit<Book & { tags: Array<string> }, '_id'>,
	'image'
> = reactive({
	name: '',
	synopsis: '',
	tags: [],
	author: '',
	editorial: '',
})
const tag = ref('')
// Fetch data
const tags = ref<Array<Tag> | null>(null)
const authors = ref<Array<Author> | null>(null)
const editorials = ref<Array<Editorial> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$libraryService.getTags(),
			$libraryService.getAuthors(),
			$libraryService.getEditorials(),
		])
		tags.value = dataFetch[0]
		authors.value = dataFetch[1]
		editorials.value = dataFetch[2]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

function onFileSelected(e: Event) {
	const target = e.target as HTMLInputElement
	let image: File | undefined
	if (target.files) image = target.files[0]
	if (!image?.type?.includes('image')) {
		toasts.addToast({
			message: 'Debe seleccionar una imagen',
			type: 'error',
		})
		return
	}
	const reader = new FileReader()
	reader.readAsDataURL(image)
	reader.onload = (e) => {
		src.value = e.target?.result?.toString() ?? ''
	}
}

function getTag(_id: string | Tag) {
	const findIndex = tags.value?.findIndex((t) => t._id === _id)
	if (findIndex !== undefined && tags.value) return tags.value[findIndex].tag
}

function addTag() {
	if (!book.tags.includes(tag.value)) book.tags.push(tag.value)
}

function removeTag(index: number) {
	book.tags.splice(index, 1)
}

async function uploadBook() {
	const dataFetch = await $libraryService.uploadBook(
		book,
		fileInput.value?.files ?? null,
		files.value,
	)
	if (dataFetch) router.push('/admin/biblioteca')
}
</script>

<template>
	<NuxtLayout name="admin">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<AdminPanel :nav="false">
			<!-- Data -->
			<h2>Nuevo Libro</h2>
			<HTMLForm :form="uploadBook">
				<section class="Header">
					<article class="Header__essentials">
						<label for="name">Nombre</label>
						<HTMLInput id="name" v-model:value="book.name" />
						<label for="biography">Sinopsis</label>
						<HTMLTextArea v-model:value="book.synopsis" />
					</article>
					<figure class="Header__image">
						<img
							title="Subir imagen"
							:src="src"
							alt="Subir imagen"
							@click="() => fileInput?.click()"
						/>
						<input
							ref="fileInput"
							style="display: none"
							accept=".jpg, .jpeg, .png"
							type="file"
							@change="(e) => onFileSelected(e)"
						/>
					</figure>
				</section>
				<label for="book">Archivo | Libro</label>
				<HTMLInputFiles
					id="book"
					v-model:files="files"
					accept="application/pdf"
					:filter="{
						filter: true,
						type: 'pdf',
						message: 'Se requiere un archivo PDF',
					}"
				/>
				<label for="author">Autor</label>
				<HTMLSelect id="author" v-model:value="book.author">
					<option value="">Seleccione un autor</option>
					<option
						v-for="author in authors"
						:key="author._id"
						:value="author._id"
					>
						{{ author.name }}
					</option>
				</HTMLSelect>
				<label for="editorial">Editorial</label>
				<HTMLSelect id="editorial" v-model:value="book.editorial">
					<option value="">Seleccione un autor</option>
					<option
						v-for="editorial in editorials"
						:key="editorial._id"
						:value="editorial._id"
					>
						{{ editorial.editorial }}
					</option>
				</HTMLSelect>
				<h3><i class="fa-solid fa-tags" /> Categorias</h3>
				<ul>
					<li v-for="(tag, i) in book.tags" :key="i">
						{{ getTag(tag) }}
						<HTMLButtonIcon
							class="Delete"
							:click="() => removeTag(i)"
							class-item="fa-solid fa-minus"
						/>
					</li>
				</ul>
				<span v-if="book.tags.length === 0">Sin categorias</span>
				<HTMLButtonIcon
					title="Añadir categoria"
					class-item="fa-solid fa-plus"
					:click="() => (modal = true)"
				/>
				<HTMLButton type="submit">Subir libro</HTMLButton>
			</HTMLForm>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<Modal v-model:opened="modal">
			<template #title>
				<h2>Añadir categoria</h2>
			</template>
			<HTMLForm :form="addTag">
				<label for="tag">Categoria</label>
				<HTMLSelect id="tag" v-model:value="tag">
					<option value="">Seleccione una categoria</option>
					<option v-for="tag in tags" :key="tag._id" :value="tag._id">
						{{ tag.tag }}
					</option>
				</HTMLSelect>
				<HTMLButton type="submit">Añadir categoria</HTMLButton>
			</HTMLForm>
		</Modal>
	</NuxtLayout>
</template>

<style scoped>
.Header {
	display: grid;
	grid-template-columns: 1fr 200px;
	gap: 20px;
	margin-top: 20px;
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
}

img {
	width: 200px;
	height: 200px;
	object-fit: cover;
	border: 2px solid var(--color-light);
}

ul {
	padding: 0 15px;
}

li {
	display: flex;
	gap: 10px;
}

.Delete {
	width: min-content;
}

@media (max-width: 767.98px) {
	.Header {
		grid-template-columns: 1fr 150px;
		gap: 10px;
		margin-top: 0;
	}

	img {
		width: 150px;
		height: 150px;
	}

	label,
	p,
	span {
		font-size: 0.9rem;
	}

	small {
		font-size: 0.75rem;
	}
}

@media (max-width: 575.98px) {
	.Header {
		grid-template-columns: 1fr 100px;
	}

	img {
		width: 100px;
		height: 100px;
	}

	small,
	p,
	span {
		text-align: center;
	}
}
</style>
