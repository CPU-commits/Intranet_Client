<script setup lang="ts">
import Toasts from '~~/components/Toast/Toasts.vue'
const spinner = useSpinner()

watch(
	() => useConsent(),
	async (newValue) => {
		if (!newValue.value) {
			// Destroy session
			const { remove } = await useSession()
			await remove()
			// Goto index
			location.replace('/')
		} else {
			const { refresh } = await useSession()
			await refresh()
		}
	},
)
</script>

<template>
	<div class="All">
		<!-- Loading -->
		<Loading v-if="spinner" />
		<!-- Toasts -->
		<Toasts />
		<!-- Menu -->
		<ClientOnly>
			<Menu />
		</ClientOnly>
		<main>
			<slot />
		</main>
		<Footer />
		<ClientOnly>
			<Cookies />
		</ClientOnly>
	</div>
</template>

<style scoped>
main {
	width: 100%;
	display: flex;
	justify-content: center;
	margin-bottom: 250px;
}

main div {
	width: 100%;
	max-width: 1600px;
}
</style>
