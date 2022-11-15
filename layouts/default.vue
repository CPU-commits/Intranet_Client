<script setup lang="ts">
import Toasts from '~~/components/Toast/Toasts.vue'
const spinner = useSpinner()
</script>

<template>
	<div>
		<!-- Loading -->
		<Loading v-if="spinner" />
		<!-- Toasts -->
		<Toasts />
		<!-- Menu -->
		<Menu />
		<main>
			<slot />
		</main>
	</div>
</template>

<style scoped>
main {
	width: 100%;
	display: flex;
	justify-content: center;
}

main div {
	width: 100%;
	max-width: 1600px;
}
</style>
