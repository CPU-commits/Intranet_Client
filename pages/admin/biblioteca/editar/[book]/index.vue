<script setup lang="ts">
// Types
import type { Book } from '~~/models/library/book.model'
import type { Tag } from '~~/models/library/tag.model'
import type { Author } from '~~/models/library/author.model'
import type { Editorial } from '~~/models/library/editorial.model'
import { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTIVE,
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.LIBRARIAN,
    ],
})
// Nuxtapp
const {
    $fetchModule,
    $libraryService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()
// Stores
const toasts = useToastsStore()
// Router
const router = useRouter()
const route = useRoute()

const idBook = route.params.book
// SSR
const book = ref<Book | null>(null)
if (typeof idBook === 'string') {
    try {
        book.value = await $libraryService.getBook(idBook)
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        throw createError(_err)
    }
} else {
    throw createError({
        message: '[book] must be string',
        statusCode: 400,
    })
}

// Modal
const modal = ref(false)
// Form
const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<FileList | null>(null)
const src = ref(book.value.image.url)
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

function addTag() {
    const findIndex = tags.value?.findIndex((t) => t._id === tag.value)
    if (findIndex && tags.value) {
        if (!(book.value?.tags as Array<Tag>).some((t) => t._id === tag.value))
            (book.value?.tags as Array<Tag>).push(tags.value[findIndex])
    }
}

function removeTag(_id: string) {
    if (book.value)
        book.value.tags = (book.value.tags as Array<Tag>).filter((tag) => {
            if (tag._id !== _id) return tag
        })
}

async function updateBook() {
    if (book.value) {
        const dataFetch = await $libraryService.updateBook(
            book.value,
            fileInput.value?.files ?? null,
            files.value,
        )
        if (dataFetch) router.push('/admin/biblioteca')
    }
}
</script>

<template>
    <NuxtLayout name="admin">
        <AdminPanel :nav="false">
            <!-- Data -->
            <HTMLForm v-if="book" :form="updateBook">
                <section class="Header">
                    <article class="Header__essentials">
                        <label for="name">Nombre</label>
                        <HTMLInput v-model:value="book.name" id="name" />
                        <label for="biography">Sinopsis</label>
                        <HTMLTextArea v-model:value="book.synopsis" />
                    </article>
                    <figure class="Header__image">
                        <img
                            @click="() => fileInput?.click()"
                            title="Subir imagen"
                            :src="src"
                            alt="Subir imagen"
                        />
                        <input
                            @change="(e) => onFileSelected(e)"
                            ref="fileInput"
                            style="display:none"
                            accept=".jpg, .jpeg, .png"
                            type="file"
                        />
                    </figure>
                </section>
                <label for="book">Archivo | Libro</label>
                <HTMLInputFiles
                    accept="application/pdf"
                    :filter="{
                        filter: true,
                        type: 'pdf',
                        message: 'Se requiere un archivo PDF',
                    }"
                    v-model:files="files"
                    id="book"
                />
                <!-- Author -->
                <label for="author">Autor</label>
                <HTMLSelect id="author" v-model:value="(book.author as Author)._id">
                    <option value="">Seleccione un autor</option>
                    
                    <option v-for="author in authors" :key="author._id" :value="author._id">
                        {{ author.name }}
                    </option>
                </HTMLSelect>
                <!-- Editorial -->
                <label for="editorial">Editorial</label>
                <HTMLSelect id="editorial" v-model:value="(book.editorial as Editorial)._id">
                    <option value="">Seleccione un autor</option>
                    
                    <option v-for="editorial in editorials" :key="editorial._id" :value="editorial._id">
                        {{ editorial.editorial }}
                    </option>
                </HTMLSelect>
                <h3><i class="fa-solid fa-tags" /> Categorias</h3>
                <ul>
                    <li v-for="tag in (book?.tags as Array<Tag>)" :key="tag._id">
                        {{ tag.tag }}
                        <HTMLButtonIcon
                            class="Delete"
                            :click="() => removeTag(tag._id)"
                            classItem="fa-solid fa-minus"
                        />
                    </li>
                </ul>
                <span v-if="book?.tags.length === 0">Sin categorias</span>
                <HTMLButtonIcon
                    title="Añadir categoria"
                    classItem="fa-solid fa-plus"
                    :click="() => modal = true"
                />
                <HTMLButton type="submit">Actualizar libro</HTMLButton>
            </HTMLForm>

            <SpinnerGet v-if="spinner" />
            <Error v-if="error" :err="error" />

            <!-- Modals -->
            <Modal v-model:opened="modal">
                <template #title>
                    <h2 >Añadir categoria</h2>
                </template>
                <HTMLForm :form="addTag">
                    <label for="tag">Categoria</label>
                    <HTMLSelect v-model:value="tag" id="tag">
                        <option value="">Seleccione una categoria</option>
                        <option v-for="tag in tags" :value="tag._id" :key="tag._id">
                            {{ tag.tag }}
                        </option>
                    </HTMLSelect>
                    <HTMLButton type="submit">Añadir categoria</HTMLButton>
                </HTMLForm>
            </Modal>
        </AdminPanel>
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
</style>
