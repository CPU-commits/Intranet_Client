<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Notificaciones - Usuario - ${schoolName} - Intranet`
	: 'Notificaciones - Usuario - Intranet'
// Nuxtapp
const { $notificationService, $fetchModule } = useNuxtApp()
// Stores
const authStore = useAuthStore()

// Data
const preferences = useNotificationsPreference()

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		preferences.value =
			await $notificationService.getNotificationPreferences()
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})
</script>

<template>
	<User>
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<template #title>
			<h2>Notificaciones</h2>
		</template>
		<section class="Notifications">
			<h3>
				<i class="fa-solid fa-shapes" /> Dentro de la aplicaci&oacute;n
			</h3>
			<section class="Notifications__in-app">
				<article class="Notifications__in-app--article">
					<div>
						<h4><i class="fa-solid fa-globe" /> Globales</h4>
						<p>
							Notificaciones que pretenden llegar a todos los
							usuarios.
						</p>
						<p>
							Ejemplo: Noticia p&uacute;blicada, nuevo libro, etc.
						</p>
					</div>
					<div class="Notifications__article--checkbox">
						<HTMLCheckbox
							id="global"
							v-model:checked="
								preferences.preferences.app.globals
							"
							@update:checked="
								() =>
									$notificationService.changeNotificationPreference(
										preferences,
									)
							"
						/>
					</div>
				</article>
				<article
					v-if="
						authStore.userTypeIs(
							UserTypesKeys.STUDENT,
							UserTypesKeys.STUDENT_DIRECTIVE,
						)
					"
					class="Notifications__in-app--article"
				>
					<div>
						<h4>
							<i class="fa-solid fa-chalkboard-user" /> Aula
							Virtual
						</h4>
						<p>
							Notificaciones que pretender llegar a solo su
							m&oacute;dulo de Aula Virtual.
						</p>
						<p>
							Ejemplo: Un trabajo o publicaci&oacute;n subida por
							el profesor.
						</p>
					</div>
					<div class="Notifications__article--checkbox">
						<HTMLCheckbox
							id="classroom"
							v-model:checked="
								preferences.preferences.app.classroom
							"
							@update:checked="
								() =>
									$notificationService.changeNotificationPreference(
										preferences,
									)
							"
						/>
					</div>
				</article>
				<article class="Notifications__in-app--article">
					<div>
						<h4><i class="fa-solid fa-user" /> Personalizadas</h4>
						<p>
							Notificaciones que pretenden llegar solo a ti, es
							decir, a un &uacute;nico usuario.
						</p>
						<p>
							Ejemplo: Entrega de una calificaci&oacute;n privada,
							o informaci&oacute;n sensible.
						</p>
					</div>
					<div class="Notifications__article--checkbox">
						<HTMLCheckbox
							id="custom"
							v-model:checked="
								preferences.preferences.app.customs
							"
							@update:checked="
								() =>
									$notificationService.changeNotificationPreference(
										preferences,
									)
							"
						/>
					</div>
				</article>
			</section>
			<h3><i class="fa-solid fa-mobile-button"></i> De celular</h3>
			<span>Actualmente no est&aacute;n soportadas.</span>
			<h3><i class="fa-solid fa-envelope" /> Email</h3>
			<span>
				Actualmente no existen notificaciones por correo, pero s&iacute;
				vamos a mandar correos para recuperar su contraseña o similares.
			</span>
		</section>
	</User>
</template>

<style lang="scss" scoped>
.Notifications {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.Notifications__in-app {
	display: flex;
	padding: 8px;
	flex-direction: column;
	gap: 10px;
}

.Notifications__in-app--article {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 100px;
	div {
		max-width: 300px;
	}
}

.Notifications__article--checkbox {
	max-width: 100px;
}
</style>
