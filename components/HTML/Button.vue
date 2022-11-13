<script setup lang="ts">
const { type, click } = defineProps<{
    type: keyof typeof TypeButton
    click?: () => any
}>()

// Types
enum TypeButton {
	'button',
	'submit',
}
</script>

<template>
    <button @click="click" :type="type">
        <slot />
    </button>
</template>

<style lang="scss" scoped>
	button {
		width: 100%;
		padding: 8px;
		background-color: var(--color-main);
		border: none;
		color: white;
		transition: all 0.3s ease;
		border-radius: 5px;
	}

	button:hover {
		-webkit-box-shadow: 3px 3px 0 1.5px #3134e1;
		-moz-box-shadow: 3px 3px 0 1.5px #3134e1;
		box-shadow: 3px 3px 0 1.5px #3134e1;
	}

	// Media queries
	@media (max-width: 767.98px) {
		button {
			padding: 6px;
			border-radius: 3px;
			font-size: 0.85rem;
		}
	}

	@media (max-width: 575.98px) {
		button {
			padding: 5px;
			border-radius: 2px;
			font-size: 0.8rem;
		}
	}
</style>
