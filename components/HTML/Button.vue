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
</style>
