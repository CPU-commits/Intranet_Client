<script setup lang="ts">
// Types
import type { Ref } from 'vue'

// Props
const {
	classItem,
	title,
	click,
	color,
	selected,
	hover,
	oneHundred
} = defineProps({
	classItem: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		default: '',
	},
	click: {
		type: Function,
		default: null,
	},
	color: {
		type: String,
		default: '',
	},
	selected: {
		type: Boolean,
		default: false,
	},
	hover: {
		type: String,
		default: 'var(--color-main)',
	},
	oneHundred: {
		type: Boolean,
		default: true,
	},
})

const btn = ref(null) as Ref<HTMLButtonElement | null>

onMounted(() => {
	if (color) btn.value?.style.setProperty('--color-i', color)
	if (hover) btn.value?.style.setProperty('--hover-i', hover)
	if (oneHundred)
		btn.value?.style.setProperty('--one-hundred', '100%')
	else btn.value?.style.setProperty('--one-hundred', 'min-content')
})

onBeforeUpdate(() => {
	if (btn && btn.value && color) btn.value.style.setProperty('--color-i', color)
})
</script>

<template>
    <button
        ref="btn"
        :class="selected ? 'Selected' : ''"
        :title="title"
        @click="() => click()"
        type="button"
    >
        <i :class="classItem" />
        <span class="Text">
            <slot />
        </span>
    </button>
</template>

<style scoped>
	button {
		background: transparent;
		border: none;
		width: var(--one-hundred);
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 5px;
	}

	button:hover i,
	button:hover .Text {
		color: var(--hover-i);
	}

	i,
	.Text {
		font-size: 1rem;
		transition: all 0.4s ease;
		color: var(--color-i);
	}

	.Selected {
		color: var(--color-main) !important;
	}

	
	@media (max-width: 767.98px) {
		i {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 575.98px) {
		i {
			font-size: 0.72rem;
		}
	}
</style>
