<script setup lang="ts">
defineProps<{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	form: () => any
}>()
</script>

<template>
	<form class="FormClass" @submit.prevent="form">
		<slot />
	</form>
</template>

<style>
.FormClass {
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 15px;
}

@media (max-width: 575.98px) {
	.FormClass label {
		font-size: 0.9rem;
	}
}
</style>
