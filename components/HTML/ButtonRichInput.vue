<script setup lang="ts">
const { title, click, selected, disabled } = withDefaults(defineProps<{
    title?: string
    click: () => any
    selected?: boolean
    disabled?: boolean
}>(), { title: '', selected: false, disabled: false })
</script>

<template>
    <button
        class="RichButton"
        :disabled="disabled"
        :class="selected ? 'RichButtonSelected' : ''"
        :title="title"
        @click="click"
        type="button"
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
