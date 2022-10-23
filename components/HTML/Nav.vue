<script setup lang="ts">
// Types
import type { Ref } from 'vue';

type Navigate = {
	activate: boolean
	fn?: (n: number) => any
	max?: number
}

const { navigate } = defineProps<{
	navigate: Navigate
}>()

const total = inject<Ref<number>>('total')
const search = useSearch()
// Paginate
if (!total)
	throw createError({
		message: 'Total no injected',
		statusCode: 500,
		fatal: true,
	})
const pages = ref(Math.ceil(total.value / (navigate?.max ?? 1)))
const selected = ref(0)

// Mount and watch
onMounted(() => {
	memo.value = new Array(pages.value)
})
watch(total, (newValue) => {
	pages.value = Math.ceil(newValue / (navigate?.max ?? 1))
	// Init memo
	memo.value = new Array(pages.value)
})
watch(search, () => {
	setSelected(0)
})
// Memo
const emits = defineEmits<{
	(e: 'memo', value: any): void
}>()
const memo = ref<Array<any> | null>(null)
// Set page selected
async function setSelected(toSet: number) {
	if (navigate.fn && memo.value) {
		if (!search.value && memo.value[toSet]) {
			emits('memo', memo.value[toSet])
		} else if (search.value && memo.value.every((v) => v !== null)) {
			memo.value.filter(() => {
				
			})
		} else {
			const value = await navigate.fn(toSet)
			if (value !== undefined) memo.value[toSet] = value
		}
	}
	selected.value = toSet
}

function getIndex(index: number) {
	return pages.value > 5 ?
		(selected.value + 4 > pages.value - 1
			? index + (pages.value - 5)
			: index + selected.value)
		: index
}
</script>

<template>
	<nav class="Table__nav">
		<button @click="() => setSelected(0)" :disabled="selected === 0">
			<i class="fa-solid fa-angles-left" />
		</button>
		<button @click="() => setSelected(selected - 1)" :disabled="selected === 0">
			<i class="fa-solid fa-angle-left" />
		</button>
		<button
			v-for="index in (pages > 5 ? 5 : pages)"
			@click="() => setSelected(getIndex(index) - 1)"
			:class="(getIndex(index) - 1) === selected ? 'Selected' : ''"
		>
			{{ getIndex(index) }}
		</button>
		<span v-if="selected + 5 < pages"><i class="fa-solid fa-ellipsis" /></span>
		<button
			@click="() => setSelected(selected + 1)"
			:disabled="pages === selected + 1 || pages === 0"
		>
			<i class="fa-solid fa-angle-right" />
		</button>
		<button
			@click="() => setSelected(pages - 1)"
			:disabled="pages === selected + 1 || pages === 0"
		>
			<i class="fa-solid fa-angles-right" />
		</button>
	</nav>
</template>

<style scoped>
	.Table__nav {
		margin-top: 10px;
		display: flex;
		gap: 5px;
		justify-content: center;
		align-items: flex-end;
		flex-wrap: wrap;
	}

	.Selected {
		background-color: var(--color-main) !important;
		color: white !important;
	}

	.Table__nav button {
		background-color: white;
		border: none;
		width: 25px;
		height: 25px;
		color: var(--color-main);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button:disabled,
	button:disabled i {
		color: var(--color-light) !important;
	}

	i {
		color: var(--color-main);
	}
</style>
