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
			<Offline />
		</ClientOnly>
	</NuxtLayout>
</template>
