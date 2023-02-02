<script setup lang="ts">
// Socket.io
import { io, Socket } from 'socket.io-client'
// Types
import type { NotificationType } from '~~/models/notification/notification.model'
import type { ErrorFetch } from '~~/common/fetchModule'

import onScroll from '~~/utils/onScroll'
import { UserTypesKeys } from '~~/models/user/user.model'
// Nuxtapp
const { $fetchModule, $notificationService } = useNuxtApp()
// Config
const config = useRuntimeConfig()
// Composable
const notificationsNumber = useNotification()
const preferences = useNotificationsPreference()
// Store
const auth = useAuthStore()
// Router
const route = useRoute()
// Sockets
const socket = io(`ws://${config.public.WS}`, {
	extraHeaders: {
		Authorization: auth.getToken ?? '',
	},
}).connect()
let socketStudents: Socket
if (auth.userTypeIs(UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE))
	socketStudents = io(`ws://${config.public.WS}/students`, {
		extraHeaders: {
			Authorization: auth.getToken ?? '',
		},
	})

watch(
	() => preferences.value.preferences.app,
	() => {
		handleConnectSocket()
	},
	{
		deep: true,
	},
)

// Ref
const notificationEl = ref<HTMLElement | null>(null)
// Data
const notifications = ref<Array<NotificationType> | null>(null)

const error = ref<ErrorFetch | null>(null)
async function getNotifications(total = false, skip = 0) {
	try {
		const dataFetch = await $notificationService.getNotifications(
			total,
			skip,
		)

		if (total || !notifications.value) {
			notifications.value = dataFetch.notifications

			onScroll({
				total: dataFetch.total ?? 0,
				max: 10,
				async fx(n) {
					await getNotifications(false, n)
					return n
				},
				element: notificationEl.value ?? undefined,
			})
		} else {
			notifications.value.push(...dataFetch.notifications)
		}
		return true
	} catch (err) {
		error.value = $fetchModule.handleError(err)
		return false
	}
}

function handleConnectSocket() {
	// Try to connect
	// Global socket
	const { globals, classroom, customs } = preferences.value.preferences.app
	if (globals || customs)
		socket.on('notify/global', () => {
			notificationsNumber.value++
		})
	else if (!globals && !customs) socket.removeAllListeners('notify/global')
	/* Students socket */
	if (
		auth.userTypeIs(
			UserTypesKeys.STUDENT,
			UserTypesKeys.STUDENT_DIRECTIVE,
		) &&
		classroom
	) {
		socketStudents.on('notify/students', () => {
			notificationsNumber.value++
		})
	} else if (
		auth.userTypeIs(
			UserTypesKeys.STUDENT,
			UserTypesKeys.STUDENT_DIRECTIVE,
		) &&
		!classroom &&
		!customs
	) {
		socketStudents.removeAllListeners('notify/students')
	}
}

// Notifications
const notificationsOpen = ref(false)

onMounted(async () => {
	// Get preferences from server
	const preferencesData =
		await $notificationService.getNotificationPreferences()
	preferences.value = preferencesData
	// Try to connect to socket
	handleConnectSocket()
	// Get nofications count
	try {
		notificationsNumber.value =
			await $notificationService.getNotificationsCount()
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err)
	}
})

// Menu functions
function toogleMenu() {
	notificationsNumber.value = 0
	notificationsOpen.value = !notificationsOpen.value

	if (notificationsOpen.value) {
		getNotifications(true)
	}
}

function deleteNotification(index: number) {
	if (notifications.value) notifications.value.splice(index, 1)
}
</script>

<template>
	<section class="Container">
		<button
			v-if="
				preferences.preferences.app.globals ||
				preferences.preferences.app.customs ||
				(auth.userTypeIs(
					UserTypesKeys.STUDENT,
					UserTypesKeys.STUDENT_DIRECTIVE,
				) &&
					preferences.preferences.app.classroom)
			"
			@click="toogleMenu"
		>
			<i
				:class="route.path.startsWith('/noticias') ? 'News' : ''"
				class="fa-solid fa-bell"
			/>
			<span
				v-if="notificationsNumber && notificationsNumber < 100"
				class="notifications"
			>
				{{ notificationsNumber }}
			</span>
			<span v-else-if="notificationsNumber" class="notifications">
				99
			</span>
		</button>
		<NuxtLink
			v-else
			title="Administrar notificaciones"
			to="/usuario/notificaciones"
		>
			<i class="fa-solid fa-bell-slash" />
		</NuxtLink>

		<section
			v-if="notificationsOpen"
			ref="notificationEl"
			class="Notifications"
		>
			<h4>Notificaciones</h4>
			<div class="Notifications__container">
				<NotificationsNotification
					v-for="(notification, i) in notifications"
					v-if="notifications"
					:key="notification._id"
					:toggle-menu="toogleMenu"
					:notification="notification"
					@delete="() => deleteNotification(i)"
				/>
				<p v-if="notifications && notifications.length === 0">
					Sin notificaciones...
				</p>

				<SpinnerGet />
				<Error v-if="error" :err="error" />
			</div>
		</section>
	</section>
</template>

<style lang="scss" scoped>
.Container {
	position: relative;
}

button,
a {
	background-color: transparent;
	border: none;
	font-family: 'Karla', sans-serif;
	text-decoration: none;
	i {
		color: var(--color-main);
		font-size: 1rem;
	}
	position: relative;
}

span {
	background-color: var(--color-danger);
	color: white;
	position: absolute;
	border-radius: 100%;
	height: 14px;
	width: 14px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 0.7rem;
	bottom: -6px;
	right: -8px;
}

.Notifications {
	position: absolute;
	top: -3px;
	width: 400px;
	right: 20px;
	background-color: white;
	box-shadow: var(--box-shadow);
	box-sizing: border-box;
	border: 1px solid var(--color-light);
	max-height: 400px;
	overflow-y: auto;
	z-index: 4;
}

h4 {
	width: 100%;
	padding: 10px;
	box-sizing: border-box;
	border-bottom: 1px solid var(--color-light);
}

.News {
	color: white;
}

.Notifications__container {
	padding: 10px;
}

@media (max-width: 767.98px) {
	.fa-bell {
		font-size: 0.95rem;
	}

	.Notifications {
		width: 300px;
	}

	h4 {
		padding: 5px;
		font-size: 0.9rem;
	}
}

@media (max-width: 575.98px) {
	.Notifications {
		width: 250px;
	}

	.fa-bell {
		font-size: 0.9rem;
	}
}
</style>
