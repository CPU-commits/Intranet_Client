<script lang="ts" setup>
const props = withDefaults(
	defineProps<{
		value?: Array<string>
		options: Array<{
			value: string
			key: string
		}>
		legend?: string
	}>(),
	{ value: () => [], legend: '' },
)

// Values
const values = ref(props.value)

defineEmits<{
	(e: 'update:value', v: Array<string>): void
}>()
</script>

<template>
	<fieldset class="Multiple">
		<legend v-if="legend">{{ legend }}</legend>
		<div v-for="(option, i) in options" :key="i" class="Multiple__item">
			<input
				v-model="values"
				type="checkbox"
				:value="option.key"
				@change="() => $emit('update:value', values)"
			/>
			<span>{{ option.value }}</span>
		</div>
	</fieldset>
</template>

<style scoped>
.Multiple__item {
	display: flex;
	gap: 10px;
}
</style>
