<script setup lang="ts">
definePageMeta({
	auth: false,
})
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Recuperar contraseña - ${schoolName} - Intranet`
	: 'Recuperar contraseña - Intranet'

// Nuxt app
const { $fetchModule, $userService } = useNuxtApp()
// Stores
const toasts = useToastsStore()
// UserForm
const contact = ref('')

async function recover() {
	try {
		await $userService.recoverPassword(contact.value)
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		toasts.addToast({
			message: _err.message,
			type: 'error',
		})
	}
}
</script>

<template>
	<section class="Session">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
		</Head>
		<!-- Body -->
		<div class="Session__content">
			<HTMLForm :form="recover">
				<label for="rut">RUT o Email</label>
				<HTMLInput id="rut" v-model:value="contact" />
				<HTMLButton type="submit">Recuperar contraseña</HTMLButton>
				<footer>
					<NuxtLink to="/"> Iniciar sesi&oacute;n </NuxtLink>
				</footer>
			</HTMLForm>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.dark-mode .Session .Session__content {
	background-color: var(--color-main-dark-contrast);
}

.dark-mode .Session .Session__content {
	box-shadow: var(--box-shadow);
}

.Session {
	margin: 20px;
	display: flex;
	justify-content: center;
	.Session__content {
		background-color: white;
		padding: 20px;
		width: 400px;
		border-radius: 15px;
	}
}

footer {
	border-top: 1px solid var(--color-light);
	padding-top: 10px;
}

a {
	color: var(--color-main);
	margin-top: 10px;
}
</style>
