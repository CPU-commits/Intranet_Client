<script setup lang="ts">
const { value, id, change, dataId } = defineProps<{
    value: any
    id: string
    change?: (...a: any) => any
    dataId?: string
}>()

const emits = defineEmits<{
	(e: 'update:value', value: any): void,
}>()

function onChange(e: Event) {
	const select = e.target as HTMLInputElement
	emits('update:value', select.value)
	if (change) change()
}
</script>

<template>
    <select
		:data-id="dataId"
		:value="value"
		:id="id"
		@change="onChange"
	>
        <slot />
    </select>
</template>

<style lang="scss" scoped>
	select {
		width: 100%;
		padding: 10px;
		box-sizing: border-box;
		border: none;
		border-bottom: 3px var(--color-light) solid;
		transition: all 0.4s ease-in-out;
		background-color: transparent;
	}

	select:focus {
		border-bottom: 3px var(--color-main) solid;
		outline: none;
	}
</style>
