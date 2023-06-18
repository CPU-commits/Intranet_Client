<script setup lang="ts">
defineProps({
	// eslint-disable-next-line vue/require-prop-types
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
	// eslint-disable-next-line vue/require-default-prop
	keyup: {
		type: Function,
	},
	checked: {
		type: Boolean,
	},
})

defineEmits<{
	(e: 'update:value', value: any): void
	(e: 'update:checked', checked: boolean): void
}>()
</script>

<template>
	<input
		:id="id"
		:class="type === 'color' ? 'Color' : ''"
		:value="value"
		:type="type"
		:checked="checked"
		:placeholder="placeholder"
		@keyup="keyup ?? null"
		@input="
			$emit('update:value', ($event.target as HTMLInputElement).value)
		"
		@change="
			$emit('update:checked', ($event.target as HTMLInputElement).checked)
		"
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

// Media queries
@media (max-width: 767.98px) {
	input {
		padding: 8px;
		font-size: 0.8rem;
	}
}

@media (max-width: 575.98px) {
	input {
		padding: 7px;
		font-size: 0.75rem;
		border-bottom: 1px var(--color-light) solid;
	}

	input:focus {
		border-bottom: 1.5px var(--color-main) solid;
		outline: none;
	}
}
</style>
