<script setup lang="ts">
defineProps<{
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
