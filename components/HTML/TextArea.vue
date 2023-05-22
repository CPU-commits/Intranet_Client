<script setup lang="ts">
defineProps<{
	value: string | undefined
	placeholder?: string

	keydown?: () => any
}>()

defineEmits<{
	(e: 'update:value', value: any): void
}>()
</script>

<template>
	<textarea
		:value="value"
		:placeholder="placeholder"
		@keyup="keydown"
		@input="
			$emit('update:value', ($event.target as HTMLInputElement).value)
		"
	/>
</template>

<style lang="scss" scoped>
textarea {
	resize: none;
	height: 70px;
	width: 100%;
	padding: 10px;
	background-color: transparent;
	box-sizing: border-box;
	border: none;
	border-bottom: 3px var(--color-light) solid;
	transition: all 0.4s ease-in-out;
}

textarea:focus {
	border-bottom: 3px var(--color-main) solid;
	outline: none;
}

// Media queries
@media (max-width: 767.98px) {
	textarea {
		padding: 8px;
		font-size: 0.8rem;
	}
}

@media (max-width: 575.98px) {
	textarea {
		padding: 7px;
		font-size: 0.75rem;
		border-bottom: 1px var(--color-light) solid;
	}

	textarea:focus {
		border-bottom: 1.5px var(--color-main) solid;
		outline: none;
	}
}
</style>
