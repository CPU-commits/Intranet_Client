/* type ErrorMessage = {
	message: string
}

function messageInError(err: unknown): err is ErrorMessage {
	return typeof err === 'object' && err !== null && 'message' in err
} */

export default defineNuxtPlugin(() => {
	/* nuxtApp.hook('vue:error', (err, _, info) => {
		if (messageInError(err)) {
			nuxtApp.vueApp.$nuxt.$logger.error({
				message: `${info} ${err.message}`,
				context: 'vue:error',
				labels: ['vue', 'client'],
			})
		} else {
			nuxtApp.vueApp.$nuxt.$logger.error({
				message: `${info}`,
				context: 'vue:error',
				labels: ['vue', 'client'],
			})
		}
	})
	nuxtApp.hook('app:error', (err) => {
		if (messageInError(err)) {
			nuxtApp.vueApp.$nuxt.$logger.error({
				message: `${err.message}`,
				context: 'vue:error',
				labels: ['vue', 'client'],
			})
		} else {
			nuxtApp.vueApp.$nuxt.$logger.error({
				message: err,
				context: 'vue:error',
				labels: ['vue', 'client'],
			})
		}
	}) */
})
