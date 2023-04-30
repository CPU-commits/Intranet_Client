<script lang="ts" setup>
// Types
import type { ErrorFetch } from '~/common/fetchModule'

defineProps<{
	error: ErrorFetch
	number: number
}>()

defineEmits<{
	(e: 'report', report: { error: ErrorFetch; index: number }): void
}>()
</script>

<template>
	<article class="Error">
		<p>{{ number + 1 }}. {{ error.message }}</p>
		<div>
			<HTMLButtonIcon
				class-item="fa-solid fa-triangle-exclamation"
				:click="() => $emit('report', { error, index: number })"
				title="Reportar"
			/>
		</div>
	</article>
</template>

<style scoped>
.Error {
	display: flex;
	width: 100%;
	justify-content: space-between;
	border-bottom: 1px solid var(--color-light);
	padding: 10px;
}

p {
	max-width: 60ch;
}
</style>
