<script setup lang="ts">
const { value, placeholder, keydown } = defineProps<{
    value: string | undefined
    placeholder?: string
    keydown?: () => any
}>()
</script>

<template>
    <textarea
		@keyup="keydown"
		:value="value"
		:placeholder="placeholder"
		@input="$emit('update:value', ($event.target as HTMLInputElement).value)"
	/>
</template>

<style lang="scss" scoped>
	textarea {
		resize: none;
		height: 70px;
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		border: none;
		border-bottom: 3px var(--color-light) solid;
		transition: all 0.4s ease-in-out;
	}

	textarea:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}
</style>
