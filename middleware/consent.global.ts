import { CONSENT_LOCAL } from '@/common/cookies'

export default defineNuxtRouteMiddleware(async (_to, _from) => {
	if (process.server) return
	let hasConsent = false
	const consent = localStorage.getItem(CONSENT_LOCAL)
	if (!consent) localStorage.setItem(CONSENT_LOCAL, 'false')
	else hasConsent = consent === 'true'
	if (!hasConsent) {
		const { remove } = await useSession()
		await remove()
	}
})
