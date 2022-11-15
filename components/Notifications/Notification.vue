<script setup lang="ts">
// Types
import type { NotificationType } from '~~/models/notification/notification.model'
import { timeAgo } from '~~/utils/format'

// Props
const props = defineProps<{
	notification: NotificationType
	toggleMenu: () => void
}>()
// Nuxtapp
const { $notificationService } = useNuxtApp()

// Emits
const emits = defineEmits<{
	(e: 'delete'): void
}>()

async function deleteNotification() {
	emits('delete')
	await $notificationService.deleteNotification(props.notification._id)
}

function getClassroomIcon() {
	if (props.notification.notification.type === 'global') return ''
	if (props.notification.notification.type_classroom === 'publication')
		return '<i class="fa-solid fa-comment-dots"></i>'
	if (props.notification.notification.type_classroom === 'work')
		return '<i class="fa-solid fa-laptop-file"></i>'
	if (props.notification.notification.type_classroom === 'grade')
		return '<i class="fa-solid fa-pencil"></i>'
}
</script>

<template>
	<article class="Notification">
		<NuxtLink :to="notification.notification.url" @click="toggleMenu">
			<img
				v-if="notification.notification?.img"
				:src="notification.notification.img"
				:alt="notification.notification.title"
			/>
			<div class="Notification__text">
				<h3>
					{{ notification.notification.title }}
					<!-- eslint-disable-next-line vue/no-v-html -->
					<span v-html="getClassroomIcon()" />
				</h3>
				<span
					v-if="
						notification.notification.type === 'classroom' &&
						notification.notification.subject
					"
				>
					Materia:
					{{ notification.notification.subject.subject }}
				</span>
				<small>
					{{ timeAgo(notification.date) }}
				</small>
			</div>
		</NuxtLink>
		<button class="Notification__delete" @click="deleteNotification">
			<i class="fa-solid fa-x" />
		</button>
	</article>
</template>

<style scoped>
a {
	text-decoration: none;
	display: flex;
	gap: 15px;
}

a:hover h3 {
	color: var(--color-main);
}

.Notification {
	width: 100%;
	cursor: pointer;

	position: relative;
	padding: 10px;
	box-sizing: border-box;
	border-bottom: 1px solid var(--color-light);
}

img {
	width: 80px;
	height: 60px;
	object-fit: cover;
}

h3 {
	font-family: 'Karla', sans-serif;
	font-size: 0.9rem;
	transition: all 0.4s;
}

small {
	position: absolute;
	white-space: nowrap;
	font-size: 0.6rem;
	bottom: 5px;
	right: 0;
}

.Notification__delete {
	position: absolute;
	top: 5px;
	right: 5px;
}

button {
	background-color: transparent;
	border: none;
	font-size: 10px;
}

@media (max-width: 767.98px) {
	.Notification {
		padding: 5px;
	}

	h3 {
		font-size: 0.8rem;
	}

	small {
		font-size: 0.58rem;
	}
}

@media (max-width: 575.98px) {
	span {
		font-size: 0.7rem;
	}
}
</style>
