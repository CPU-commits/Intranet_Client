<script setup lang="ts">
const { form } = defineProps<{
    form: () => any
}>()
</script>

<template>
	<form class="Form" @submit.prevent="form">
		<slot />
	</form>
</template>

<style scoped>
	.Form {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 15px;
	}
</style>
