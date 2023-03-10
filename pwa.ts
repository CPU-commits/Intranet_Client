import { useRegisterSW } from 'virtual:pwa-register/vue'

useRegisterSW({
	onOfflineReady() {
		const toastStore = useToastsStore()

		toastStore.addToast({
			message: 'Listo para trabajar fuera de linea',
			type: 'success',
		})
	},
})
