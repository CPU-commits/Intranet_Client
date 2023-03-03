<script setup lang="ts">
// Moment
import moment from 'moment'
// Types
import type { Editor } from '@tiptap/core'
import type { UserFile } from '~~/models/file/file.model'
import type { Annoucement } from '~~/models/home/annoucement.model'
import type { User } from '~~/models/user/user.model'
// Nuxtapp
const { $homeService } = useNuxtApp()
// Stores
const toasts = useToastsStore()
const auth = useAuthStore()

// Tiptap
const editor = ref<Editor | null>(null)
// Cloud
const modal = ref(false)
const filesAttached = ref<Array<UserFile>>([])
// Emits
const emits = defineEmits<{
	(e: 'newAnnoucement', annoucement: Annoucement): void
}>()

async function uploadAnnoucement() {
	try {
		const annoucement = editor.value?.getHTML()
		if (editor.value && editor.value.getText() === '')
			throw new Error('Debe escribir algo a anunciar')
		const idInserted = await $homeService.uploadAnnoucement(
			editor.value?.getHTML() ?? '',
			filesAttached.value.map((file) => getFileID(file._id)),
		)
		if (idInserted !== undefined) {
			// Push annoucement
			const user = {
				name: auth.getName,
				first_lastname: '',
			} as User
			const now = moment().toDate()
			const annoucementData = {
				_id: idInserted,
				annoucement,
				user,
				files: filesAttached.value,
				update_date: now,
				upload_date: now,
			} as Annoucement
			emits('newAnnoucement', annoucementData)
			// Notify
			editor.value?.commands.setContent('<p></p>')
			filesAttached.value = []
		}
	} catch (err) {
		if (err instanceof Error)
			toasts.addToast({
				message: err.message,
				type: 'error',
			})
	}
}

function deleteFile(index: number) {
	filesAttached.value.splice(index, 1)
}
</script>

<template>
	<div class="Annoucement_Write">
		<HTMLForm :form="uploadAnnoucement">
			<HTMLRich
				:have-background="true"
				placeholder="¿Algo que anunciar?"
				@build-editor="(e: Editor) => editor = e"
			/>
			<footer class="Home__annoucements--footer">
				<HTMLButtonIcon
					title="Adjuntar archivos"
					:click="() => (modal = !modal)"
					class-item="fa-solid fa-paperclip"
				/>
			</footer>
			<HTMLButton type="submit">Publicar anuncio</HTMLButton>
		</HTMLForm>
		<footer class="Annoucement_Write__attached">
			<section
				v-for="(file, i) in filesAttached"
				:key="getFileID(file._id)"
				class="Annoucement_Write__attached--file"
			>
				<HomeFile :file="file" @delete="() => deleteFile(i)" />
				<span v-if="i + 1 < filesAttached.length">┈</span>
			</section>
		</footer>

		<!-- Modal Cloud -->
		<Cloud
			v-model:modal="modal"
			@files="(f: Array<UserFile>) => filesAttached = f"
		/>
	</div>
</template>

<style scoped>
.Annoucement_Write {
	border-bottom: 2px solid var(--color-light);
	padding-bottom: 10px;
}

.Home__annoucements--footer {
	width: 0;
	padding-left: 10px;
}

.Annoucement_Write__attached {
	display: flex;
	width: 100%;
	margin-top: 10px;
	padding: 5px;
	flex-wrap: wrap;
	gap: 10px;
}

.Annoucement_Write__attached--file {
	display: flex;
	gap: 5px;
}

.Annoucement_Write__attached--file span {
	padding-left: 3px;
}

@media (max-width: 575.98px) {
	.Annoucement_Write__attached {
		margin-top: 5px;
		gap: 5px;
	}

	.Annoucement_Write__attached--file {
		gap: 0;
		align-items: center;
	}
}
</style>
