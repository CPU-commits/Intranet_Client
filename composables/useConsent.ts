import { CONSENT_LOCAL } from '~~/common/cookies'

export default () => {
	return useState(
		'has_consent',
		() => localStorage?.getItem(CONSENT_LOCAL) === 'true' ?? false,
	)
}
