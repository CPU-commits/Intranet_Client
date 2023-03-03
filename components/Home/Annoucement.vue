<script setup lang="ts">
// Types
import type { Annoucement } from '@@/models/home/annoucement.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import { formatDateLL } from '~~/utils/format'
import { differentDates } from '~~/utils/dates'
// Props
const props = defineProps<{
	annoucement: Annoucement
}>()
// Nuxtapp
const { $homeService } = useNuxtApp()
// Stores
const auth = useAuthStore()

// Emits
const emits = defineEmits<{
	(e: 'delete', id: string): void
}>()
// Modal
const modal = ref(false)

async function deleteAnnoucement() {
	modal.value = false
	// Delete annoucement
	const isDeleted = await $homeService.deleteAnnoucement(
		props.annoucement._id,
	)
	if (isDeleted) emits('delete', props.annoucement._id)
}
</script>

<template>
	<article class="Annoucement">
		<aside
			v-if="
				auth.userTypeIs(UserTypesKeys.DIRECTIVE, UserTypesKeys.DIRECTOR)
			"
		>
			<HTMLButtonIcon
				class-item="fa-solid fa-xmark"
				:click="() => (modal = true)"
			/>
		</aside>
		<div class="Annoucement__body">
			<header>
				<HTMLRich
					:read-only="true"
					:have-background="false"
					:body="annoucement.annoucement"
				/>
			</header>
			<footer class="Annoucement__body--footer">
				<section
					v-for="(file, i) in annoucement?.files"
					:key="getFileID(file._id)"
				>
					<HomeFile :file="file" />
					<span v-if="i + 1 < annoucement.files.length">┈</span>
				</section>
			</footer>
		</div>
		<footer>
			<small>
				{{ formatDateLL(annoucement.upload_date) }}
				<span
					v-if="
						differentDates(
							annoucement.update_date,
							annoucement.upload_date,
						)
					"
				>
					(editado)
				</span>
			</small>
			<small>
				Publicado por
				<span class="Annoucemenet__author">
					{{ annoucement.user.name }}
					{{ annoucement.user.first_lastname }}
				</span>
			</small>
		</footer>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Eliminar anuncio</h2>
			</template>
			<div class="Modal__content">
				<span>¿Est&aacute; seguro de eliminar el anuncio?</span>
			</div>
			<footer class="Modal__buttons">
				<HTMLButtonText
					:click="deleteAnnoucement"
					color="var(--color-danger)"
				>
					Eliminar anuncio
				</HTMLButtonText>
				<HTMLButtonText :click="() => (modal = false)">
					No, no eliminar anuncio
				</HTMLButtonText>
			</footer>
		</Modal>
	</article>
</template>

<style scoped lang="scss">
aside {
	position: absolute;
	right: 10px;
	top: 10px;
	z-index: 9;
}

.Annoucement {
	display: flex;
	max-width: 1000px;
	flex-direction: row-reverse;
	position: relative;
	width: 100%;
	background-color: white;
	padding: 20px;
	box-shadow: var(--box-shadow);
	border-radius: 8px;
}

.Annoucement__body {
	margin-bottom: 10px;
	width: 100%;
}

.Annoucement__body--footer {
	display: flex;
	margin-top: 20px;
	flex-wrap: wrap;
}

.Annoucement footer {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	gap: 10px;
	small,
	span {
		text-align: left;
	}
	small:first-child {
		font-size: 1rem;
	}
}

.Annoucemenet__author {
	color: var(--color-main);
	font-weight: bold;
}

.Modal__content {
	display: flex;
	width: 100%;
	justify-content: center;
}

.Modal__buttons {
	display: flex;
	margin-top: 10px;
}

@media (max-width: 575.98px) {
	.Annoucement {
		padding: 5px;
		flex-direction: column;
	}

	.Annoucement__bodt {
		margin-bottom: 0;
	}

	.Annoucement footer {
		flex-direction: column;
		align-items: center;
		gap: 3px;
	}

	footer small,
	.Annoucement footer small:first-child {
		font-size: 0.7rem;
		width: fit-content;
	}
}
</style>
