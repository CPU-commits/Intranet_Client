<script setup lang="ts">
// Type
import type { ComponentPublicInstance } from 'vue';

const { value, search, placeholder } = withDefaults(defineProps<{
    value: string
    search: () => any
    placeholder?: string
}>(), { placeholder: 'Buscar' })

// Search compostable
const isSearch = useSearch()
const searchEl = ref<ComponentPublicInstance |null>(null)

function searchFunction() {
    if (searchEl.value && (searchEl.value.$el as HTMLInputElement).value !== '') {
        search()
        isSearch.value = true
    } else if (isSearch) {
        isSearch.value = false
    }
}

onUnmounted(() => {
    isSearch.value = false
})
</script>

<template>
    <div class="Search">
        <button @click="search">
            <i class="fa-solid fa-magnifying-glass" />
        </button>
        <HTMLInput
            ref="searchEl"
            @keyup="searchFunction"
            :placeholder="placeholder"
            :value="value"
            @input="$emit('update:value', ($event.target as HTMLInputElement).value)"
            type="search"
            id="search"
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
</style>
