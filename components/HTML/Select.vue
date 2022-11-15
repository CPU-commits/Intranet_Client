<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const props = defineProps<{
	value: any
	id: string
	change?: (...a: any) => any
	dataId?: string
}>()

const emits = defineEmits<{
	(e: 'update:value', value: any): void
}>()

function onChange(e: Event) {
	const select = e.target as HTMLInputElement
	emits('update:value', select.value)
	if (props.change) props.change()
}
</script>

<template>
	<select :id="id" :data-id="dataId" :value="value" @change="onChange">
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

// Media queries
@media (max-width: 767.98px) {
	select {
		padding: 8px;
		font-size: 0.8rem;
	}
}

@media (max-width: 575.98px) {
	select {
		padding: 7px;
		font-size: 0.75rem;
		border-bottom: 1px var(--color-light) solid;
	}

	select:focus {
		border-bottom: 1.5px var(--color-main) solid;
	}
}
</style>
