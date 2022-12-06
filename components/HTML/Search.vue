<script setup lang="ts">
// Type
import type { ComponentPublicInstance } from 'vue'

const props = withDefaults(
	defineProps<{
		value: string

		search: () => any
		placeholder?: string
	}>(),
	{ placeholder: 'Buscar' },
)

// Search compostable
const isSearch = useSearch()
const searchEl = ref<ComponentPublicInstance | null>(null)

function searchFunction() {
	if (
		searchEl.value &&
		(searchEl.value.$el as HTMLInputElement).value !== ''
	) {
		props.search()
		isSearch.value = true
	} else if (isSearch) {
		isSearch.value = false
	}
}

onUnmounted(() => {
	isSearch.value = false
})

defineEmits<{
	(e: 'update:value', value: any): void
}>()
</script>

<template>
	<div class="Search">
		<button @click="search">
			<i class="fa-solid fa-magnifying-glass" />
		</button>
		<HTMLInput
			id="search"
			ref="searchEl"
			:placeholder="placeholder"
			:value="value"
			type="search"
			@keyup="searchFunction"
			@input="
				$emit('update:value', ($event.target as HTMLInputElement).value)
			"
		/>
	</div>
</template>

<style lang="scss" scoped>
.Search {
	display: flex;
	align-items: center;
}

button {
	background-color: var(--color-main);
	border: none;
	height: 36px;
	width: 36px;
	border-top-left-radius: 8px;
}

i {
	color: white;
}

@media (max-width: 767.98px) {
	button {
		height: 31px;
	}
}

@media (max-width: 575.98px) {
	button {
		height: 27.5px;
		width: 30px;
		i {
			font-size: 0.6rem;
		}
	}
}
</style>
