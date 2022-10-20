<script setup lang="ts">
// Stores
const toasts = useToastsStore()
// Types
type Filter = {
	filter: boolean
	type?: string
	message?: string
}

const { id, accept, filter, onChange, multiple } = withDefaults(defineProps<{
	id?: string
	accept?: string
	filter?: Filter
	onChange?: () => any
	multiple?: boolean
}>(), { id: '', accept: '*', multiple: false })
// Emits
const emits = defineEmits<{
	(e: 'update:files', files: FileList): void
}>()

function onFileSelected(e: Event) {
	const file = e.target as HTMLInputElement
	if (filter?.filter && file.files) {
		let image = file.files[0]
		if (!image.type?.includes(filter?.type ?? '')) {
			toasts.addToast({
				message: filter?.message ?? 'Error de tipo en el formulario',
				type: 'error',
			})
			return
		}
	}

	if (file.files)
		emits('update:files', file.files)
	if (onChange) onChange()
}
</script>

<template>
	<input
		:multiple="multiple"
		:accept="accept"
		type="file"
		:id="id"
		@change="onFileSelected"
	/>
</template>

<style lang="scss" scoped>
	input {
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		border: none;
		border-bottom: 3px var(--color-light) solid;
		transition: all 0.4s ease-in-out;
	}

	input:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}
</style>
