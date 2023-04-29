import { Session } from '~/models/session/session'

async function useSession<T>() {
	const session = ref<Session<T> | null>(null)
	// Get session
	session.value = await $fetch('/api/session')
	// Set functions
	const remove = async () => {
		await $fetch('/api/session', {
			method: 'DELETE',
		})
		session.value = null
	}
	const refresh = async () => {
		await $fetch('/api/session/refresh', {
			method: 'POST',
		})
	}
	const overwrite = async (data: any) => {
		session.value = await $fetch<Session<any>>('/api/session', {
			method: 'POST',
			body: data,
		})
	}
	const reset = async () => {
		session.value = await $fetch('/api/session/reset', {
			method: 'POST',
		})
	}

	return {
		session,
		remove,
		refresh,
		overwrite,
		reset,
	}
}

export default useSession
