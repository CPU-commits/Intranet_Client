<script setup lang="ts">
// Types
import { UserFile } from '~~/models/file/file.model'
// Utils
import { getIcon } from '@@/utils/getIcon'
import { formatDate } from '~~/utils/format'
// Props
const props = withDefaults(
	defineProps<{
		file: UserFile
		edit?: boolean
		idModule?: string
		canDownload?: boolean
		minimalist?: boolean
		isClassroom?: boolean
	}>(),
	{
		edit: false,
		canDownload: true,
		minimalist: false,
		isClassroom: false,
		idModule: '',
	},
)
// Nuxtapp
const { $filesService } = useNuxtApp()
// Emits
defineEmits<{
	(e: 'delete', index: string): void
}>()

async function downloadFile() {
	if (props.canDownload) {
		let urlToken: string | undefined
		if (props.isClassroom && props.idModule) {
			urlToken = await $filesService.downloadFileClassroom(
				getFileID(props.file._id),
				props.idModule,
			)
		} else {
			urlToken = await $filesService.downloadFile(
				getFileID(props.file._id),
			)
		}
		// Download
		if (urlToken !== undefined) $filesService.downloadFileUrl(urlToken)
	}
}
</script>

<template>
	<article v-if="!minimalist" class="File">
		<div class="File__container" @click="downloadFile">
			<header>
				<i :class="getIcon(file.type)" />
			</header>
			<div class="File__content">
				<h3>{{ file.title }}</h3>
				<small>{{ formatDate(file.date) }}</small>
			</div>
		</div>
		<aside v-if="edit">
			<HTMLButtonIcon
				:click="() => $emit('delete', getFileID(file._id))"
				class-item="fa-solid fa-xmark"
			/>
		</aside>
	</article>
	<article v-else class="FileMin" @click="downloadFile">
		<span>┈</span>
		<i :class="getIcon(file.type)" />
		<h4>{{ file.title }}</h4>
	</article>
</template>

<style scoped>
.File {
	width: 100%;
	border: 2px solid var(--color-light);
	border-radius: 5px;
	max-width: 500px;
	cursor: pointer;
	position: relative;
}

.File__container {
	display: flex;
	align-items: center;
}

.File__container:hover h3 {
	color: var(--color-main);
}

header {
	padding: 14px;
	border-right: 2px solid var(--color-light);
}

h3 {
	transition: all 0.4s ease;
	max-width: 30ch;
	overflow: hidden;
	text-overflow: ellipsis;
}

i {
	color: var(--color-main);
	font-size: 1.4rem;
}

.File__content {
	display: flex;
	flex-direction: column;
	padding: 10px;
	width: 100%;
}

aside {
	position: absolute;
	right: 10px;
	top: 20px;
}

.FileMin {
	display: flex;
	align-items: center;
	gap: 10px;
	cursor: pointer;
	width: fit-content;
}

.FileMin i {
	font-size: 1.1rem;
}

.FileMin:hover h4 {
	color: var(--color-main);
}

.FileMin h4 {
	transition: all 0.4s;
}

@media (max-width: 767.98px) {
	.File__content {
		padding: 5px;
	}

	h3 {
		font-size: 1.1rem;
	}

	small {
		font-size: 0.75rem;
	}

	.FileMin {
		gap: 8px;
	}

	.FileMin i {
		font-size: 1rem;
	}

	.FileMin h4 {
		font-size: 0.9rem;
	}
}

@media (max-width: 575.98px) {
	header {
		padding: 10px;
	}

	i {
		font-size: 1.2rem;
	}

	h3 {
		font-size: 0.95rem;
	}

	small {
		font-size: 0.7rem;
	}

	aside {
		top: 5px;
		right: 4px;
	}

	.FileMin {
		gap: 5px;
	}

	.FileMin i {
		font-size: 0.9rem;
	}

	.FileMin h4 {
		font-size: 0.75rem;
	}
}
</style>
