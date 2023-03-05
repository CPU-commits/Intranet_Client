<script setup>
// PWA
import { useRegisterSW } from 'virtual:pwa-register/vue'
// Stores
const toastStore = useToastsStore()

useHead({
	htmlAttrs: {
		lang: 'es',
	},
	title: 'Intranet',
})

useRegisterSW({
	onOfflineReady() {
		toastStore.addToast({
			message: 'Listo para trabajar fuera de linea',
			type: 'success',
		})
	},
})
</script>

<template>
	<NuxtLayout>
		<VitePwaManifest />
		<NuxtPage />
	</NuxtLayout>
</template>
