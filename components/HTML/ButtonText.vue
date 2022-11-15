<script setup lang="ts">
// Types
import { Ref } from 'vue'

// Props
const props = withDefaults(
	defineProps<{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		click: () => any
		color?: string
	}>(),
	{ color: 'var(--color-main)' },
)

const button: Ref<HTMLButtonElement | null> = ref(null)

onMounted(() => {
	button.value?.style.setProperty('--color-button', props.color)
})
</script>

<template>
	<button ref="button" type="button" @click="click">
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

@media (max-width: 575.98px) {
	button {
		font-size: 0.9rem;
		padding: 5px;
	}
}
</style>
