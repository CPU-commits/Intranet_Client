<!-- eslint-disable vue/no-mutating-props -->
<script setup lang="ts">
// Types
import type { Publication } from '~~/models/classroom/publication.model'
import { formatDate, timeAgo } from '~~/utils/format'
// Props
const props = defineProps<{
	publication: Publication
	idModule: string
	canEdit?: boolean
}>()
// Nuxtapp
const { $publicationsService } = useNuxtApp()
// Emits
const emits = defineEmits<{
	(e: 'delete', value: void): void
}>()

const open = ref(false)
// Modal
const modalEdit = ref(false)
const modalDelete = ref(false)

// Functions
const editPublicationText = ref('')

async function deletePublication() {
	modalDelete.value = false
	const deleted = await $publicationsService.deletePublication(
		props.publication._id,
		props.idModule,
	)
	if (deleted) {
		emits('delete')
	}
}

async function deleteAttached(id: string) {
	const deleted = await $publicationsService.deleteAttached(
		id,
		props.idModule,
	)
	if (deleted) {
		props.publication.attached = props.publication.attached.filter(
			(att) => att._id !== id,
		)
	}
}

async function editPublication() {
	const edited = await $publicationsService.editPublication(
		props.publication._id,
		editPublicationText.value,
	)
	if (edited) {
		props.publication.content.content = editPublicationText.value
		props.publication.update_date = new Date()
	}
}
</script>

<template>
	<article class="Publication">
		<aside v-if="canEdit">
			<HTMLButtonIcon
				:click="() => (open = !open)"
				class-item="fa-solid fa-ellipsis-vertical"
			/>
			<div
				class="Publication__config"
				:class="open ? 'Publication__config--open' : ''"
			>
				<button
					class="Default__buttons"
					@click="
						() => {
							modalEdit = true
							editPublicationText = publication.content.content
							open = false
						}
					"
				>
					<i class="fa-solid fa-pen-to-square" /> Editar
				</button>
				<button
					class="Default__buttons"
					@click="
						() => {
							modalDelete = true
							open = false
						}
					"
				>
					<i class="fa-solid fa-trash-can" /> Eliminar
				</button>
			</div>
		</aside>
		<div class="Publication__content">
			<pre>{{ publication.content.content }}</pre>
		</div>
		<section
			v-if="publication.attached && publication?.attached?.length > 0"
			class="Attached"
		>
			<h4><i class="fa-solid fa-thumbtack" /> Adjuntos</h4>
			<div v-for="(attached, i) in publication.attached" :key="i">
				<CloudFile
					v-if="attached.type === 'file'"
					:edit="true"
					:id-module="idModule"
					:file="attached.file"
					:can-download="true"
					@delete="() => deleteAttached(attached._id)"
				/>
				<ClassLink
					v-else
					:delete-me="() => deleteAttached(attached._id)"
					:edit="true"
					:link="{
						link: attached.link,
						title: attached.title,
					}"
				/>
			</div>
		</section>
		<footer class="Publication__footer">
			<div class="Publication__footer--info">
				<small>
					Publicado por
					<span>{{ publication.content.author }}</span>
				</small>
				<small
					v-if="
						publication.update_date.toString() !==
						publication.upload_date.toString()
					"
				>
					(editado {{ formatDate(publication.update_date) }})
				</small>
			</div>
			<small>{{ timeAgo(publication.upload_date) }}</small>
		</footer>

		<!-- Modals -->
		<Modal v-model:opened="modalDelete">
			<template #title>
				<h2>Eliminar publicaci&oacute;n</h2>
			</template>
			<span class="SpanDelete">
				¿Est&aacute; seguro de querer eliminar esta publicaci&oacute;n?
			</span>
			<footer class="ModalDelete">
				<HTMLButtonText
					color="var(--color-danger)"
					:click="deletePublication"
				>
					S&iacute;, eliminar
				</HTMLButtonText>
				<HTMLButtonText
					color="var(--color-dark)"
					:click="() => (modalDelete = false)"
				>
					No, no eliminar
				</HTMLButtonText>
			</footer>
		</Modal>

		<Modal v-model:opened="modalEdit">
			<template #title>
				<h2>Editar publicaci&oacute;n</h2>
			</template>
			<HTMLForm :form="editPublication">
				<HTMLTextArea v-model:value="editPublicationText" />
				<HTMLButton type="submit">Editar</HTMLButton>
			</HTMLForm>
		</Modal>
	</article>
</template>

<style lang="scss" scoped>
.Publication {
	border: 1px solid var(--color-light);
	padding: 15px;
	background-color: white;
	border-radius: 10px;
	box-shadow: var(--box-shadow);
	transition: all 0.4s ease;
	position: relative;
}

.Publication:hover {
	box-shadow: none;
}

aside {
	position: absolute;
	right: 15px;
}

.Publication__config {
	position: absolute;
	background-color: white;
	top: 0;
	right: 10px;
	padding: 5px 10px;
	z-index: 4;
	border: 1px solid var(--color-light);
	display: none;
}

.Publication__config--open {
	display: block;
}

.Publication__config button {
	padding: 3px 0;
	width: 100%;
	display: flex;
	gap: 5px;
	transition: all 0.4s;
	font-size: 0.8rem;
	text-decoration: none;
	i {
		transition: all 0.4s;
	}
}

.Publication__config button:first-child:hover {
	color: var(--color-news);
	i {
		color: var(--color-news);
	}
}

.Publication__config button:last-child:hover {
	color: var(--color-danger);
	i {
		color: var(--color-danger);
	}
}

.Default__buttons {
	border: none;
	background-color: transparent;
}

i {
	cursor: pointer;
}

.Publication__content {
	display: flex;
	gap: 20px;
	padding: 15px;
	justify-content: space-between;
	align-items: center;
}

.Attached {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 15px;
}

.Attached div {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 15px;
	width: 100%;
}

.Attached__buttons {
	display: flex;
	gap: 10px;
}

.Publication__footer {
	margin-top: 5px;
	display: flex;
	justify-content: space-between;
}

.Publication__footer--info {
	display: flex;
	flex-direction: column;
}

small {
	padding: 3px;
	border-radius: 3px;
}

small span {
	color: var(--color-main);
}

.SpanDelete {
	text-align: center;
	color: var(--color-danger);
}

.ModalDelete {
	margin-top: 20px;
	display: flex;
	gap: 20px;
}

@media (max-width: 767.98px) {
	.Publication {
		padding: 10px;
		font-size: 0.9rem;
	}

	.Publication__content {
		padding: 10px;
	}

	aside {
		right: 10px;
	}
}

@media (max-width: 575.98px) {
	.Publication {
		padding: 8px;
		font-size: 0.8rem;
	}

	.Publication__content {
		padding: 8px;
	}

	aside {
		right: 5px;
	}

	small {
		font-size: 0.65rem;
	}
}
</style>
