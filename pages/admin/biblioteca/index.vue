<script setup lang="ts">
// Types
import type { Ref } from 'vue'
import type { ErrorFetch } from '~~/common/fetchModule'
import type { Author } from '~~/models/library/author.model'
import type { Book } from '~~/models/library/book.model'
import type { Editorial } from '~~/models/library/editorial.model'
import type { Tag } from '~~/models/library/tag.model'
import type { User } from '~~/models/user/user.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import { formatDate } from '~~/utils/format'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTIVE,
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.LIBRARIAN,
    ],
})
// NuxtApp
const {
	$libraryService,
	$fetchModule,
	$directivesService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()
// Stores
const auth = useAuthStore()

const search = ref('')
// Form
let librarianForm = {
    name: '',
    first_lastname: '',
    second_lastname: '',
    rut: '',
}
const why = ref('')
const librarianEdit = ref<User>({} as User)
const librarianIndex = ref(0)
// Table
const navigate = {
	activate: true,
	max: 20,
	async fn (n: number) {
		try {
			// Clean error
			error.value = null
			// Get data
			const dataFetch = await $libraryService.getBooks(false, n * 20, search.value)
			books.value = dataFetch.books

			return dataFetch.books
		} catch (err) {
			const _err = $fetchModule.handleError(err)
			error.value = _err
		}
	},
}
// Fetch data
const librarians: Ref<Array<User> | null> = ref(null)
const books: Ref<Array<Book> | null> = ref(null)
const editorials: Ref<Array<Editorial> | null> = ref(null)
const tags: Ref<Array<Tag> | null> = ref(null)
const total = ref(0)

const error: Ref<ErrorFetch | null> = ref(null)
// Provide total for use
provide('total', total)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$libraryService.getLibrarians(),
			$libraryService.getTags(),
			$libraryService.getEditorials(),
			$libraryService.getBooks(true, 0),
		])

		librarians.value = dataFetch[0]
		tags.value = dataFetch[1]
		editorials.value = dataFetch[2]
		books.value = dataFetch[3].books
		total.value = dataFetch[3].total
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

// Functions
async function searchFunction() {
	try {
		// Clean error
		error.value = null
		// Get data
		const dataFetch = await $libraryService.getBooks(true, 0, search.value)

		books.value = dataFetch.books
		total.value = dataFetch.total
	}catch(err){
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}

// Modals
const modalLibrarian = ref(false)
const modalAddLibrarian = ref(false)
const modalEditLibrarian = ref(false)
const modalStatus = ref(false)
const modalTags = ref(false)
const modalEditorials = ref(false)
const modalEditEditorial = ref(false)

// Librarian
function initForm(newLibrarian: User) {
    modalAddLibrarian.value = false
    librarianForm = {
        name: '',
        first_lastname: '',
        second_lastname: '',
        rut: '',
    }
	if (librarians.value)
    	librarians.value.push(newLibrarian)
}

async function uploadLibrarian() {
	const librarian = await $libraryService.uploadLibrarian(librarianForm as User)
	if (librarian)
		initForm(librarian)
}

async function editLibrarian() {
	const dataFetch = await $libraryService.editLibrarian(
		librarianEdit.value,
		librarianEdit.value._id,
	)

	if (dataFetch) {
		const index = librarianIndex.value

		modalEditLibrarian.value = false
		if(librarians.value)
			librarians.value[index] = librarianEdit.value
	}
}

async function changeStatus() {
	const index = librarianIndex.value
	const dataFetch = await $directivesService.changeStatus(why.value, librarianEdit.value._id)
	if (dataFetch && librarians.value) {
		why.value = ''
		modalStatus.value = false

		librarians.value[index].status = librarians.value[index].status === 1 ? 0 : 1
	}
}
// Tags
const tag = ref('')

async function uploadCategory() {
	const dataFetch = await $libraryService.uploadCategory(tag.value)
	if (dataFetch && tags.value) {
		tag.value = ''
		tags.value = [dataFetch, ...tags.value]
	}
}

async function deleteTag(idTag: string) {
    const dataFetch = await $libraryService.deleteTag(idTag)
	if (dataFetch && tags.value)
		tags.value = tags.value.filter((tag) => {
            if (tag._id !== idTag) return tag
        })
}
// Editorial
const editorial = ref('')
const files = ref<FileList | null>(null)
const idEditorial = ref<string>('')

async function uploadEditorial() {
	const dataFetch = await $libraryService.uploadEditorial(
		editorial.value,
		files.value,
	)
	if (dataFetch && editorials.value) {
		editorials.value = [
			dataFetch,
			...editorials.value,
		]
		files.value = null
		editorial.value = ''
	}
}

async function updateEditorial() {
	let index: number | undefined
	if (editorials.value)
		index = editorials.value.findIndex((e) => e._id === idEditorial.value)

	const dataFetch = await $libraryService.updateEditorial(
		editorial.value,
		files.value ?? null,
		idEditorial.value,
	)
    // Update
	if (dataFetch !== undefined && editorials.value !== null && index !== undefined) {
		editorials.value[index].editorial = editorial.value
		if (files.value && files.value?.length > 0)
			editorials.value[index].image.url = dataFetch

		modalEditEditorial.value = false
	}
}

async function deleteEditorial(idEditorial: string) {
	const dataFetch = await $libraryService.deleteEditorial(idEditorial)
	if (dataFetch && editorials.value)
		editorials.value = editorials.value.filter((editorial) => {
			if (editorial._id !== idEditorial) return editorial
		})
}

async function deleteBook(idBook: string) {
	const dataFetch = await $libraryService.deleteBook(idBook)
	if (dataFetch && books.value)
		books.value = books.value.filter((book) => {
			if (book._id !== idBook) return book
		})
}

// Reflect type
const returnAuthor = (author: string | Author): Author => author as Author
const returnEd = (editorial: string | Editorial): Editorial => editorial as Editorial
</script>

<template>
	<NuxtLayout name="admin">
		<AdminPanel>
			<template #nav>
				<Icons slot="nav">
					<HTMLAIcon
						title="Añadir libro"
						classItem="fa-solid fa-plus"
						href="/admin/biblioteca/nuevo_libro"
					/>
					<HTMLAIcon
						title="Autores"
						classItem="fa-solid fa-pen-nib"
						href="/admin/biblioteca/autores"
					/>
					<HTMLButtonIcon
						title="Editoriales/publicadores"
						classItem="fa-solid fa-bullhorn"
						:click="() => modalEditorials = true"
					/>
					<HTMLButtonIcon
						title="Categorias"
						classItem="fa-solid fa-tags"
						:click="() => modalTags = true"
					/>
					<HTMLButtonIcon
						v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
						title="Bibliotecarios"
						classItem="fa-solid fa-user-graduate"
						:click="() => modalLibrarian = true"
					/>
				</Icons>
			</template>
			<h2>Biblioteca - Libros</h2>
			<HTMLSearch v-model:value="search" :search="searchFunction" />
			<br />
			<!-- Data -->
			<HTMLTable
				:header="['', 'Nombre', 'Autor', 'Editorial', 'Ranking', 'Editar']"
				:navigate="navigate"
				@memo="(value) => books = value"
			>
				<tr v-for="(book, i) in books" :key="i">
					<td><img :src="book.image.url" :alt="book.name" /></td>
					<td>
						<NuxtLink class="Link" :to="`/biblioteca/libro/${book.slug}`">
							{{ book.name }}
						</NuxtLink>
					</td>
					<td>{{ returnAuthor(book.author).name }}</td>
					<td>{{ returnEd(book.editorial).editorial }}</td>
					<td>{{ book.ranking ? book.ranking : 'Sin raking' }}</td>
					<td>
						<HTMLAIcon
							classItem="fa-solid fa-pen-to-square"
							:href="`/admin/biblioteca/editar/${book.slug}`"
						/>
					</td>
					<td>
						<HTMLButtonIcon
							title="Eliminar libro"
							classItem="fa-solid fa-circle-minus"
							:click="() => deleteBook(book._id)"
						/>
					</td>
				</tr>
				<template #footer>
					<SpinnerGet v-if="spinner" />
				</template>
			</HTMLTable>
			<span v-if="books && books.length === 0">No hay libros...</span>
			<Error v-if="error" :err="error" />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modalLibrarian">
			<template #title>
				<h2>Bibliotecarios</h2>
			</template>
			<HTMLTable :header="['Nombre', 'Ap. P.', 'Ap. M.', 'RUT', 'Estado', '']">
				<tr v-for="(librarian, i) in librarians" :key="librarian._id">
					<td>{{ librarian.name }}</td>
					<td>{{ librarian.first_lastname }}</td>
					<td>{{ librarian.second_lastname }}</td>
					<td>{{ librarian.rut }}</td>
					<td>{{ librarian.status ? 'Activo' : 'Inactivo' }}</td>
					<td>
						<HTMLButton
							:click="() => {
								modalEditLibrarian = true
								modalLibrarian = false

								librarianEdit = librarian
								librarianIndex = i
							}"
							type="button"
						>
							<i class="fa-solid fa-pen-to-square" />
						</HTMLButton>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="librarians && librarians.length === 0">Sin bibliotecarios...</span>
			<br />
			<HTMLButton :click="() => {
				modalAddLibrarian = true
				modalLibrarian = false
			}" type="button">
				Nuevo bibliotecario
			</HTMLButton>
		</Modal>

		<Modal v-model:opened="modalAddLibrarian" :fn="() => modalLibrarian = true">
			<template #title>
				<h2>Nuevo bibliotecario</h2>
			</template>
			<HTMLForm :form="uploadLibrarian">
				<label for="name">Nombre</label>
				<HTMLInput v-model:value="librarianForm.name" id="name" />
				<label for="fln">Apellido Paterno</label>
				<HTMLInput v-model:value="librarianForm.first_lastname" id="fln" />
				<label for="sln">Apellido Materno</label>
				<HTMLInput v-model:value="librarianForm.second_lastname" id="sln" />
				<label for="rut">RUT</label>
				<HTMLInput v-model:value="librarianForm.rut" id="rut" />
				<HTMLButton type="submit">Agregar bibliotecario</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalEditLibrarian" :fn="() => modalLibrarian = true">
			<template #title>
				<h2 v-if="librarians">
					Editar bibliotecario
					{{ librarians[librarianIndex].name }}
					{{ librarians[librarianIndex].first_lastname }}
				</h2>
			</template>
			<HTMLForm :form="editLibrarian">
				<label for="nameE">Nombre</label>
				<HTMLInput v-model:value="librarianEdit.name" id="nameE" />
				<label for="flnE">Apellido Paterno</label>
				<HTMLInput v-model:value="librarianEdit.first_lastname" id="flnE" />
				<label for="slnE">Apellido Materno</label>
				<HTMLInput v-model:value="librarianEdit.second_lastname" id="slnE" />
				<label for="rutE">RUT</label>
				<HTMLInput v-model:value="librarianEdit.rut" id="rutE" />
				<HTMLButton type="submit">Editar bibliotecario</HTMLButton>
			</HTMLForm>
			<button
				v-if="librarianEdit.status === 1"
				@click="() => {
					modalStatus = true
					modalEditLibrarian = false
				}"
				class="Form__button Down"
				type="button">
				<i class="fa-solid fa-angles-down" /> Dar de baja bibliotecario
			</button>
			<button v-else @click="() => {
				modalStatus = true
				modalEditLibrarian = false
			}" class="Form__button Up" type="button">
				<i class="fa-solid fa-angles-up" /> Reintegrar bibliotecario
			</button>
		</Modal>

		<Modal v-model:opened="modalStatus" :fn="() => modalEditLibrarian = true">
			<template #title>
				<h2>
					Cambiar estado bibliotecario - {{ librarianEdit.status === 1
						? 'Dar de baja'
						: 'Reintegrar'
					}}
				</h2>
			</template>
			<HTMLForm :form="changeStatus">
				<label for="why">Motivo</label>
				<HTMLTextArea v-model:value="why" id="why" />
				<HTMLButton type="submit">Cambiar estado</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalTags">
			<template #title>
				<h2>Categorias</h2>
			</template>
			<HTMLForm :form="uploadCategory">
				<label for="tag">Categoria</label>
				<HTMLInput id="tag" v-model:value="tag" />
				<HTMLButton type="submit">Subir categoria</HTMLButton>
			</HTMLForm>
			<br />
			<HTMLTable :header="['Categoria', 'Fecha', '']">
				<tr v-for="tag in tags" :key="tag._id">
					<td>{{ tag.tag }}</td>
					<td>{{ formatDate(tag.date) }}</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteTag(tag._id)"
							classItem="fa-solid fa-circle-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="tags && tags.length === 0">Sin categorias...</span>
		</Modal>

		<Modal v-model:opened="modalEditorials">
			<template #title>
				<h2>Editoriales</h2>
			</template>
			
			<HTMLForm :form="uploadEditorial">
				<label for="editorial">Editorial</label>
				<HTMLInput id="editorial" v-model:value="editorial" />
				<label for="image">Imagen</label>
				<HTMLInputFiles id="image" v-model:files="files" accept="image/png, image/gif, image/jpeg" />
				<HTMLButton type="submit">Subir editorial</HTMLButton>
			</HTMLForm>
			<br />
			<HTMLTable :header="['', 'Editorial', 'Fecha', '']">
				<tr v-for="(_editorial, i) in editorials" :key="i">
					<td>
						<img :src="_editorial.image.url" alt="Editorial" />
					</td>
					<td>{{ _editorial.editorial }}</td>
					<td>{{ formatDate(_editorial.date) }}</td>
					<td>
						<HTMLButtonIcon
							:click="() => {
								modalEditEditorial = true
								modalEditorials = false
								
								idEditorial = _editorial._id
								editorial = _editorial.editorial
							}"
							classItem="fa-solid fa-pen-to-square"
						/>
					</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteEditorial(_editorial._id)"
							classItem="fa-solid fa-circle-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="editorials && editorials.length === 0">Sin editoriales...</span>
		</Modal>

		<Modal v-model:opened="modalEditEditorial" :fn="() => modalEditorials = true">
			<template #title>
				<h2>Editar editorial</h2>
			</template>
			<HTMLForm :form="updateEditorial">
				<label for="editorial">Editorial</label>
				<HTMLInput v-model:value="editorial" id="editorial" />
				<label for="image">Imagen</label>
				<HTMLInputFiles id="image" v-model:files="files" accept="image/png, image/gif, image/jpeg" />
				<HTMLButton type="submit">Subir editorial</HTMLButton>
			</HTMLForm>
		</Modal>
	</NuxtLayout>
</template>

<style lang="scss" scoped>
	i {
		color: white;
	}

	.Form__button {
		position: absolute;
		top: 75px;
		background: transparent;
		border: none;
	}

	.Down {
		color: var(--color-danger);
		i {
			color: var(--color-danger);
		}
	}

	.Up {
		color: var(--color-main);
		i {
			color: var(--color-main);
		}
	}

	img {
		width: 150px;
		height: 100px;
		object-fit: cover;
	}
</style>
