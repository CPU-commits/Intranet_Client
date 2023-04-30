import { defineStore } from 'pinia'
import { ErrorFetch } from '~/common/fetchModule'

const useToastsStore = defineStore('errors', {
	state() {
		return {
			errors: [] as Array<ErrorFetch>,
		}
	},
	getters: {},
	actions: {
		push(error: ErrorFetch) {
			if (this.errors.length > 30) this.errors.shift()
			this.errors.push(error)
			this.$persist()
		},
		spliceOne(index: number) {
			this.errors.splice(index, 1)
		},
		flush() {
			this.errors = []
		},
	},
	persist: true,
})

export default useToastsStore
