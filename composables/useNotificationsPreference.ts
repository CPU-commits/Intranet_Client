import type { NotificationPreferences } from '~~/models/notification/preferences.model'

export default () => {
	return useState(
		'notification_preferences',
		() =>
			({
				preferences: {
					app: {
						globals: true,
						classroom: true,
						customs: true,
					},
				},
			} as NotificationPreferences),
	)
}
