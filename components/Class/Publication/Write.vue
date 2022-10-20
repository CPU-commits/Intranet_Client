<script setup lang="ts">
// Types
import type { Publication } from '~~/models/classroom/publication.model'
import type { UserFile } from '~~/models/file/file.model'
type TypeObj = {
    title: string
    link: string
}
// Props
const { _section } = defineProps<{
    _section: number
}>()
// Nuxtapp
const { $publicationsService } = useNuxtApp()
// Router
const route = useRoute()

const idModule = route.params.module as string
// Emits
const emits = defineEmits<{
    (e: 'newPublication', publication: Publication): void
}>()
// Form
const text = ref('')
// Data
const filesAttached = ref<Array<UserFile>>([])
const linksAttached = ref<Array<TypeObj>>([])

function deleteFile(index: number) {
    filesAttached.value.splice(index, 1)
}

function deleteLink(index: number) {
    linksAttached.value.splice(index, 1)
}

async function uploadPublication() {
    const uploadedPublication = await $publicationsService.uploadPublication(
        text.value,
        linksAttached.value,
        filesAttached.value,
        idModule,
        _section,
    )
    if (uploadedPublication) emits('newPublication', uploadedPublication)
}
</script>

<template>
    <article class="Publication">
        <div class="Publication__writting">
            <HTMLTextArea
                placeholder="¿Qué hay para hoy?"
                v-model:value="text"
            />
            <section v-if="filesAttached.length > 0 || linksAttached.length > 0" class="Attached">
                <h4><i class="fa-solid fa-thumbtack" /> Adjuntos</h4>
                <CloudFile
                    v-for="(file, i) in filesAttached"
                    :idModule="idModule"
                    :edit="true"
                    :file="file"
                    :isClassroom="true"
                    @delete="deleteFile(i)"
                />
                <ClassLink
                    v-for="(link, i) in linksAttached"
                    :key="i"
                    :deleteMe="deleteLink"
                    :edit="true"
                    :link="link"
                />
            </section>
            <footer class="Publication__writting--footer">
                <ClassAttached
                    @newLink="(l) => linksAttached.push(l)"
                    @newFile="(f) => filesAttached = f"
                />
                <div class="Publication--footer__button">
                    <HTMLButton
                        :click="uploadPublication"
                        type="button"
                    >
                        Publicar
                    </HTMLButton>
                </div>
            </footer>
        </div>
    </article>
</template>

<style scoped>
	.Publication {
		border: 1px solid var(--color-light);
		padding: 15px;
		background-color: white;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
		transition: all 0.4s ease;
	}

	.Publication:hover {
		box-shadow: none;
	}

	.Publication__writting--footer {
		display: flex;
		gap: 20px;
		padding: 10px;
		justify-content: space-between;
		align-items: center;
	}

	.Publication--footer__button {
		max-width: 200px;
		width: 100%;
	}

	.Attached {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 15px;
	}
</style>
