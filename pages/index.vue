<script setup lang="ts">
definePageMeta({
	auth: false,
})
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Iniciar sesión - ${schoolName} - Intranet`
	: 'Iniciar sesión - Intranet'
// Nuxt app
const { $fetchModule } = useNuxtApp()
// Stores
const auth = useAuthStore()
const toasts = useToastsStore()
// Router
const router = useRouter()
const route = useRoute()

// UserForm
const userForm = {
	rut: '',
	password: '',
}

async function logIn() {
	try {
		await auth.logIn(userForm)
		if (route.query.redirect && typeof route.query.redirect === 'string')
			router.push(route.query.redirect)
		else router.push('/inicio')
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
			<HTMLForm :form="logIn">
				<label for="rut">RUT</label>
				<HTMLInput id="rut" v-model:value="userForm.rut" />
				<label for="password">Contraseña</label>
				<HTMLInput
					id="password"
					v-model:value="userForm.password"
					type="password"
				/>
				<HTMLButton type="submit">Iniciar sesi&oacute;n</HTMLButton>
			</HTMLForm>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.Session {
	margin: 20px;
	display: flex;
	justify-content: center;
	.Session__content {
		background-color: white;
		padding: 20px;
		width: 400px;
		border-radius: 15px;
		box-shadow: var(--box-shadow);
	}
}
</style>
