<script setup lang="ts">
// Types
import { Ref } from 'vue'

// Props
const { click, color } = withDefaults(defineProps<{
    click: () => any
    color?: string
}>(), { color: 'var(--color-main)' })

const button: Ref<HTMLButtonElement | null> = ref(null)

onMounted(() => {
	button.value?.style.setProperty('--color-button', color)
})
</script>

<template>
    <button ref="button" @click="click" type="button">
        <slot />
    </button>
</template>

<style lang="scss" scoped>
	button {
		width: 100%;
		padding: 8px;
		font-size: 1rem;
		border: none;
		background-color: transparent;
		color: var(--color-button);
		transition: all 0.3s ease;
		border-radius: 5px;
	}
</style>
