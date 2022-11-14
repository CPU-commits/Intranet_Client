<script setup lang="ts">
// Types
import type { Author } from '~~/models/library/author.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
    ? `Nuevo Autor - Biblioteca Virtual - Admin - ${schoolName} - Intranet`
    : 'Nuevo Autor - Biblioteca Virtual - Admin - Intranet'
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
// Router
const router = useRouter()
// Nuxtapp
const { $libraryService } = useNuxtApp()

// Modals
const modalInfo = ref(false)
const toggleInfo = () => {
    modalInfo.value = !modalInfo.value
    itemInfo.key = ''
    itemInfo.value = ''
}
// Form
const fileInput = ref<HTMLInputElement | null>(null)
const src = ref('/img/image.svg')
const author = reactive<Omit<Omit<Author, '_id'>, 'date_update'>>({
    name: '',
    biography: '',
    table_info: [],
    fun_facts: [],
    references: [],
})
const itemInfo = {
    key: '',
    value: '',
}

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
        const target = e.target
        src.value = target?.result?.toString() ?? ''
    }
}

function addElement() {
    author.table_info = [
        ...author.table_info,
        {
            key: itemInfo.key,
            value: itemInfo.value,
        },
    ]
    toggleInfo()
}

function removeElement(index: number) {
    author.table_info.splice(index, 1)
}

function addFunFact() {
    author.fun_facts = [
        ...author.fun_facts,
        {
            title: '',
            fact: '',
        },
    ]
}

function removeFact(index: number) {
    author.fun_facts.splice(index, 1)
}

function addReference() {
    author.references.push('')
}

function removeReference(index: number) {
    author.references.splice(index, 1)
}

async function uploadAuthor() {
    const dataFetch = await $libraryService.uploadAuthor(
        author,
        fileInput.value?.files ?? null,
    )
    if (dataFetch)
        router.push("/admin/biblioteca/autores")
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
            <template #title>
                <h2>Nuevo autor</h2>
            </template>
            <HTMLForm :form="uploadAuthor">
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
                            style="display: none"
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
                        <p v-if="author.table_info.length === 0">Sin elementos...</p>

                        <HTMLButtonIcon
                            title="Añadir elemento"
                            :click="toggleInfo"
                            classItem="fa-solid fa-plus"
                        />
                    </figure>
                </section>
                <h3>Datos curiosos</h3>
                <section class="Fun_facts">
                    <details v-for="(fun_fact, i) in author.fun_facts">
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
                        <br />
                        <label for="fact">Dato curioso</label>
                        <HTMLTextArea v-model:value="fun_fact.fact" />
                    </details>
                </section>
                <p v-if="author.fun_facts.length === 0">Sin datos curiosos...</p>

                <HTMLButtonIcon
                    title="Añadir referencia"
                    :click="addFunFact"
                    classItem="fa-solid fa-circle-plus"
                />
                <h3><i class="fa-solid fa-book-atlas" /> Referencias (Preferentemente APA) *</h3>
                <article v-for="(reference, i) in author.references" class="Reference" :key="i">
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
                <HTMLButton type="submit">Subir autor</HTMLButton>
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

	.Fun_facts {
		display: flex;
		flex-direction: column;
		gap: 20px;
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
