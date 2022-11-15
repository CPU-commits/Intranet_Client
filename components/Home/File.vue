<script setup lang="ts">
// Types
import { UserFile } from '~~/models/file/file.model'
// Utils
import { getIcon } from '@@/utils/getIcon'
// Props
const props = defineProps<{
	file: UserFile
	editable?: boolean
}>()
// Nuxtapp
const { $filesService } = useNuxtApp()
// Emits
defineEmits<{
	(e: 'delete', v: void): void
}>()

async function downloadFile() {
	const urlToken = await $filesService.downloadFile(props.file._id.$oid)
	if (urlToken !== undefined) $filesService.downloadFileUrl(urlToken)
}
</script>

<template>
	<div>
		<article class="FileMin" @click="downloadFile">
			<i :class="getIcon(file.type)" />
			<small>{{ file.title }}</small>
		</article>
		<HTMLButtonIcon
			v-if="editable"
			:hover="'var(--color-main)'"
			:class-item="'fa-solid fa-xmark'"
			:click="() => $emit('delete')"
		/>
	</div>
</template>

<style scoped>
div {
	display: flex;
	align-items: center;
	gap: 5px;
}

.FileMin {
	display: flex;
	align-items: center;
	gap: 5px;
	cursor: pointer;
	width: fit-content;
}

.FileMin i {
	font-size: 1.1rem;
}

.FileMin:hover small,
.FileMin:hover i {
	color: var(--color-main);
}

.FileMin small,
i {
	transition: all 0.4s;
}

@media (max-width: 575.98px) {
	.FileMin i {
		font-size: 0.75rem;
	}
}
</style>
