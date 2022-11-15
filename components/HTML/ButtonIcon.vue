<script setup lang="ts">
// Types
import type { Ref } from 'vue'

// Props
const props = defineProps({
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
	if (props.color) btn.value?.style.setProperty('--color-i', props.color)
	if (props.hover) btn.value?.style.setProperty('--hover-i', props.hover)
	if (props.oneHundred) btn.value?.style.setProperty('--one-hundred', '100%')
	else btn.value?.style.setProperty('--one-hundred', 'min-content')
})

onBeforeUpdate(() => {
	if (btn && btn.value && props.color)
		btn.value.style.setProperty('--color-i', props.color)
})
</script>

<template>
	<button
		ref="btn"
		:class="selected ? 'Selected' : ''"
		:title="title"
		type="button"
		@click="() => click()"
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
