<script setup>
useHead({
	htmlAttrs: {
		lang: 'es',
	},
	title: 'Intranet',
})
</script>

<template>
	<NuxtLayout>
		<VitePwaManifest />
		<NuxtPage />
		<ClientOnly>
			<Offline v-if="$pwa?.offlineReady" />
		</ClientOnly>
	</NuxtLayout>
</template>
