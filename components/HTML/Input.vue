<script setup lang="ts">
const { value, id, type, placeholder, keyup } = defineProps({
	value: {
		required: true,
	},
	id: {
		type: String,
		default: '',
	},
	type: {
		type: String,
		default: 'text',
	},
	placeholder: {
		type: String,
		default: '',
	},
	keyup: {
		type: Function,
	},
})
</script>

<template>
	<input
		:class="type === 'color' ? 'Color' : ''"
		@keyup="keyup ?? null"
		:value="value"
		@input="$emit('update:value', ($event.target as HTMLInputElement).value)"
		:id="id"
		:type="type"
		:placeholder="placeholder"
	/>
</template>

<style lang="scss" scoped>
	input {
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		background-color: transparent;
		border: none;
		border-bottom: 3px var(--color-light) solid;
		transition: all 0.4s ease-in-out;
	}

	input:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}

	.Color {
		padding: 0;
	}
</style>
