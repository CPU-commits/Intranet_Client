<script setup lang="ts">
defineProps<{
	title?: string

	click: () => any
	selected?: boolean
	disabled?: boolean
}>()
</script>

<template>
	<button
		class="RichButton"
		:disabled="disabled"
		:class="selected ? 'RichButtonSelected' : ''"
		:title="title"
		type="button"
		@click="click"
	>
		<slot />
	</button>
</template>

<style scoped>
button {
	background: transparent;
	border: none;
	display: flex;
	align-items: center;
	padding: 2px;
	justify-content: center;
	border-bottom: 2px solid transparent;
}
</style>
