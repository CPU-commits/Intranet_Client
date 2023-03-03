<script setup lang="ts">
// Types
import type { UserFile } from '@@/models/file/file.model'
import { ErrorFetch } from '~~/common/fetchModule'
// Props
const props = defineProps<{
	modal: boolean
}>()
// Nuxtapp
const { $fetchModule, $filesService } = useNuxtApp()

// Modal
const modalRef = ref(false)
const modal = toRef(props, 'modal')

watch(modalRef, () => {
	// Emit
	emits('update:modal', modalRef.value)
})
watch(modal, (newValue) => {
	if (newValue) getFiles()
	modalRef.value = newValue
	// Emit
	emits('update:modal', modal.value)
})
// Emits
const emits = defineEmits<{
	(e: 'files', files: Array<UserFile>): void
	(e: 'update:modal', modal: boolean): void
}>()
// Data
const files = ref<Array<UserFile> | null>(null)
const filesAttached = ref<Array<UserFile>>([])

const error = ref<ErrorFetch | null>(null)
onMounted(getFiles)

async function getFiles() {
	try {
		// Clean error
		error.value = null
		// Get files
		const dataFetch = await $filesService.getFiles()

		files.value = dataFetch
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}

function addFile(index: number) {
	if (!files.value) return
	if (
		!filesAttached.value.some(
			(f) => files.value && f === files.value[index],
		)
	) {
		filesAttached.value.push(files.value[index])
		emits('files', filesAttached.value)
	}
}
</script>

<template>
	<Modal v-model:opened="modalRef">
		<template #title>
			<h2><i class="fa-solid fa-cloud" /> Tus archivos</h2>
		</template>
		<!-- Data -->
		<section class="Files">
			<div
				v-for="(file, i) in files"
				:key="getFileID(file._id)"
				class="File"
				@click="() => addFile(i)"
			>
				<CloudFile :can-download="false" :file="file" />
			</div>
		</section>
		<span v-if="files && files.length === 0">No tienes archivos...</span>

		<br />
		<HTMLAIcon
			title="Administrar archivos"
			href="/usuario/archivos"
			class-item="fa-solid fa-cloud-arrow-up"
		/>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</Modal>
</template>

<style scoped>
.Files {
	display: flex;
	gap: 20px;
	flex-wrap: wrap;
}

.File {
	width: 100%;
	max-width: 500px;
}
</style>
