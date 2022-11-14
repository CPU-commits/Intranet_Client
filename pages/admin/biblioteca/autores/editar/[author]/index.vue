<script setup lang="ts">
// Types
import type { Author } from '~~/models/library/author.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
    ? `Editar autor - Biblioteca Virtual - Admin - ${schoolName} - Intranet`
    : 'Editar autor - Biblioteca Virtual - Admin - Intranet'
/*// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTIVE,
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.LIBRARIAN,
    ],
})*/
// NuxtApp
const {
    $fetchModule,
    $libraryService,
} = useNuxtApp()
// Stores
const toasts = useToastsStore()
// Router
const router = useRouter()
const route = useRoute()

const idAuthor = route.params.author
// SSR
const author = ref<Author | null>(null)
if (typeof idAuthor === 'string') {
    try {
        author.value = await $libraryService.getAuthor(idAuthor)
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        throw createError({
            ..._err,
            fatal: true,
        })
    }
} else {
    throw createError({
        message: '[author] must be string',
        statusCode: 400,
        fatal: true,
    })
}

// Modals
const modalInfo = ref(false)
const toggleInfo = () => {
    modalInfo.value = !modalInfo.value
    itemInfo.key = ''
    itemInfo.value = ''
}
// Form
const fileInput = ref<HTMLInputElement | null>(null)
const src = ref(author.value?.image?.url ?? '')
const itemInfo = reactive({
    key: '',
    value: '',
})

function onFileSelected(e: Event) {
    const target = e.target as HTMLInputElement
    let image: File | undefined
    if (target?.files) image = target?.files[0]
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
        const target = e.target
        src.value = target?.result?.toString() ?? ''
    }
}

function addElement() {
    if (author.value)
        author.value.table_info.push({
            key: itemInfo.key,
            value: itemInfo.value,
        })
    toggleInfo()
}

function removeElement(index: number) {
    author.value?.table_info.splice(index, 1)
}

function addFunFact() {
    author.value?.fun_facts.push({
        title: '',
        fact: '',
    })
}

function removeFact(index: number) {
    author.value?.fun_facts.splice(index, 1)
}

function addReference() {
    author.value?.references.push('')
}

function removeReference(index: number) {
    author.value?.references.splice(index, 1)
}

async function updateAuthor() {
    if (author.value) {
        const dataFetch = await $libraryService.updateAuthor(
            author.value,
            fileInput.value?.files ?? null,
        )
        if (dataFetch) router.push('/admin/biblioteca/autores')
    }
}
</script>

<template>
    <NuxtLayout name="admin">
        <!-- Head -->
        <Head>
            <Title>{{ title }}</Title>
        </Head>
        <!-- Body -->
        <AdminPanel :nav="false">
            <template #nav>
                <h2>Nuevo autor</h2>
            </template>
            <!-- Data -->
            <HTMLForm v-if="author" :form="updateAuthor">
                <section class="Header">
                    <article class="Header__essentials">
                        <label for="name">Nombre</label>
                        <HTMLInput v-model:value="author.name" id="name" />
                        <label for="biography">Biograf&iacute;a</label>
                        <HTMLTextArea v-model:value="author.biography" id="biography" />
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
                        <small>Tabla de informaci&oacute;n</small>
                        <HTMLTableSmall>
                            <tr v-for="(item, i) in author.table_info" :key="i">
                                <td>{{ item.key }}</td>
                                <td>{{ item.value }}</td>
                                <td>
                                    <HTMLButtonIcon
                                        title="Eliminar elemento"
                                        classItem="fa-solid fa-minus"
                                        :click="() => removeElement(i)"
                                    />
                                </td>
                            </tr>
                        </HTMLTableSmall>
                        <span v-if="author.table_info.length === 0">Sin elementos...</span>

                        <HTMLButtonIcon
                            title="Añadir elemento"
                            :click="toggleInfo"
                            classItem="fa-solid fa-plus"
                        />
                    </figure>
                </section>
                <h3>Datos curiosos</h3>
                <section class="Fun_facts">
                    <details v-for="(fun_fact, i) in author.fun_facts" :key="i">
                        <summary>
                            <span>
                                <label for="title">Titulo</label>
                                <HTMLButtonIcon
                                    class="Fun_facts--span"
                                    title="Eliminar dato curioso"
                                    classItem="fa-solid fa-minus"
                                    :click="() => removeFact(i)"
                                />
                            </span>
                            <HTMLInput id="title" v-model:value="fun_fact.title" />
                        </summary>
                        <label for="fact">Dato curioso</label>
                        <HTMLTextArea v-model:value="fun_fact.fact" />
                    </details>

                    <span v-if="author.fun_facts.length === 0">Sin datos curiosos...</span>
                </section>
                <HTMLButtonIcon
                    title="Añadir referencia"
                    :click="addFunFact"
                    classItem="fa-solid fa-circle-plus"
                />
                <h3><i class="fa-solid fa-book-atlas" /> Referencias (Preferentemente APA) *</h3>
                <article v-for="(_, i) in author.references" :key="i" class="Reference">
                    <HTMLInput v-model:value="author.references[i]" placeholder="Referencia" />
                    <HTMLButtonIcon
                        class="Reference__button"
                        title="Eliminar referencia"
                        classItem="fa-solid fa-minus"
                        :click="() => removeReference(i)"
                    />
                </article>
                <HTMLButtonIcon
                    title="Añadir referencia"
                    :click="addReference"
                    classItem="fa-solid fa-circle-plus"
                />
                <small>(*) Opcional</small>
                <HTMLButton type="submit">Actualizar autor</HTMLButton>
            </HTMLForm>
        </AdminPanel>

        <!-- Modals -->
        <Modal v-model:opened="modalInfo">
            <template #title>
                <h2>Añadir elemento a tabla de informaci&oacute;n</h2>
            </template>
            <HTMLForm :form="addElement">
                <label for="title">Titulo</label>
                <HTMLInput id="title" v-model:value="itemInfo.key" />
                <label for="value">Valor</label>
                <HTMLInput id="title" v-model:value="itemInfo.value" />
                <HTMLButton type="submit">Añadir elemento</HTMLButton>
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

	.Fun_facts--span {
        width: 0;
        display: inline;
        margin-left: 10px;
    }

	.Reference {
		display: flex;
		gap: 10px;
	}

    .Reference__button {
        width: 0;
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

        label, p {
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

        small, p {
            text-align: center;
        }
    }
</style>
