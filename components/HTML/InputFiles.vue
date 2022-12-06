<script setup lang="ts">
// Stores
const toasts = useToastsStore()
// Types
type Filter = {
	filter: boolean
	type?: string
	message?: string
}

const props = withDefaults(
	defineProps<{
		id?: string
		accept?: string
		filter?: Filter
		// eslint-disable-next-line vue/require-default-prop
		onChange?: () => any
		multiple?: boolean
	}>(),
	{
		id: '',
		accept: '*',
		multiple: false,
		filter: () => ({
			filter: false,
		}),
	},
)
// Emits
const emits = defineEmits<{
	(e: 'update:files', files: FileList): void
}>()

function onFileSelected(e: Event) {
	const file = e.target as HTMLInputElement
	if (props.filter?.filter && file.files) {
		const image = file.files[0]
		if (!image.type?.includes(props.filter?.type ?? '')) {
			toasts.addToast({
				message:
					props.filter?.message ?? 'Error de tipo en el formulario',
				type: 'error',
			})
			return
		}
	}

	if (file.files) emits('update:files', file.files)
	if (props.onChange) props.onChange()
}
</script>

<template>
	<input
		:id="id"
		:multiple="multiple"
		:accept="accept"
		type="file"
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
