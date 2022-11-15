<script setup lang="ts">
// Types
import type { Publication } from '~~/models/classroom/publication.model'
import type { UserFile } from '~~/models/file/file.model'
type TypeObj = {
	title: string
	link: string
}
// Props
const props = defineProps<{
	// eslint-disable-next-line vue/prop-name-casing
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
		props._section,
	)
	if (uploadedPublication) emits('newPublication', uploadedPublication)
}
</script>

<template>
	<article class="Publication">
		<div class="Publication__writting">
			<HTMLTextArea
				v-model:value="text"
				placeholder="¿Qué hay para hoy?"
			/>
			<section
				v-if="filesAttached.length > 0 || linksAttached.length > 0"
				class="Attached"
			>
				<h4><i class="fa-solid fa-thumbtack" /> Adjuntos</h4>
				<CloudFile
					v-for="(file, i) in filesAttached"
					:key="file._id.$oid"
					:id-module="idModule"
					:edit="true"
					:file="file"
					:is-classroom="true"
					@delete="deleteFile(i)"
				/>
				<ClassLink
					v-for="(link, i) in linksAttached"
					:key="i"
					:delete-me="deleteLink"
					:edit="true"
					:link="link"
				/>
			</section>
			<footer class="Publication__writting--footer">
				<!-- eslint-disable vue/v-on-event-hyphenation -->
				<ClassAttached
					@newLink="(l) => linksAttached.push(l)"
					@newFile="(f) => (filesAttached = f)"
				/>
				<div class="Publication--footer__button">
					<HTMLButton :click="uploadPublication" type="button">
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

@media (max-width: 767.98px) {
	.Publication {
		padding: 10px;
	}

	h4 {
		font-size: 0.9rem;
	}

	.Publication__writting--footer {
		gap: 15px;
		padding: 8px;
	}

	.Publication--footer__button {
		max-width: 180px;
	}
}

@media (max-width: 575.98px) {
	.Publication {
		padding: 8px;
	}

	.Publication__writting--footer {
		padding: 5px;
	}

	h4 {
		font-size: 0.8rem;
	}

	._Attached {
		gap: 5px;
	}

	.Publication--footer__button {
		max-width: 120px;
	}
}
</style>
