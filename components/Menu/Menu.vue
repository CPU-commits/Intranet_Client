<script setup lang="ts">
// Types
import { UserTypesKeys } from '~~/models/user/user.model'
import type { VotingStatus } from '~~/models/voting/voting.model'
// Utils
import { DefaultResponse } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
// Composable
const voting = useVoting()
const { $fetchModule } = useNuxtApp()
const config = useRuntimeConfig()
// Stores
const toasts = useToastsStore()
const auth = useAuthStore()
// Router
const router = useRouter()
const route = useRoute()

const url = route.path
// Menu
const shortName = config.public.SHORT_NAME
const menuOpen = ref(false)

watch(
	() => auth.isAuth,
	(newValue) => {
		if (newValue) getVotingStatus()
	},
)

onMounted(() => {
	if (auth.isAuth) getVotingStatus()
})

async function getVotingStatus() {
	try {
		const dataFetch = await $fetchModule.fetchData<
			BodyFetch<{
				status: keyof typeof VotingStatus
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/students/get_voting_status',
			spinnerStatus: true,
			token: auth.getToken,
		})
		voting.value = dataFetch.body.status
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err)
	}
}

function toggleMenu() {
	if (!open) {
		document.body.style.overflowY = 'hidden'
	} else {
		document.body.style.overflowY = 'initial'
	}
	menuOpen.value = !menuOpen.value
}

function ahref() {
	document.body.style.overflowY = 'initial'
	menuOpen.value = false
}

async function logout() {
	try {
		await auth.logOut()
		toggleMenu()

		router.push('/')
		auth.unsetAuth()
	} catch (err) {
		toasts.addToast({
			message: 'Error al cerrar sesión',
			type: 'error',
		})
	}
}
</script>

<template>
	<div>
		<menu class="Menu" :class="menuOpen ? 'Opened' : ''">
			<div
				class="Menu__container"
				:class="menuOpen ? 'Menu__opened' : ''"
			>
				<header class="Menu__header">
					<div class="Menu__header--title">
						<button @click="toggleMenu">
							<i class="fa-solid fa-bars" />
						</button>
						<NuxtLink class="NuxtLink" to="/" @click="ahref">
							<h2>{{ shortName }} Intranet</h2>
						</NuxtLink>
					</div>
				</header>
				<ul>
					<NuxtLink class="NuxtLink" to="/inicio" @click="ahref">
						<li :class="url === '/inicio' ? 'selected' : ''">
							<i class="fa-solid fa-house" />
							<span>Inicio</span>
						</li>
					</NuxtLink>
					<NuxtLink
						v-if="auth.userTypeNotIs(UserTypesKeys.DIRECTOR)"
						class="NuxtLink"
						to="/aula_virtual"
						@click="ahref"
					>
						<li
							:class="
								url.startsWith('/aula_virtual')
									? 'selected'
									: ''
							"
						>
							<i class="fa-solid fa-chalkboard" />
							<span>Aula virtual</span>
						</li>
					</NuxtLink>
					<NuxtLink class="NuxtLink" to="/noticias" @click="ahref">
						<li
							:class="
								url.startsWith('/noticias') ? 'selected' : ''
							"
						>
							<i class="fa-solid fa-newspaper" />
							<span>Noticias</span>
						</li>
					</NuxtLink>
					<NuxtLink class="NuxtLink" to="/biblioteca" @click="ahref">
						<li
							:class="
								url.startsWith('/biblioteca') ? 'selected' : ''
							"
						>
							<i class="fa-solid fa-book-bookmark" />
							<span>Biblioteca virtual</span>
						</li>
					</NuxtLink>
					<NuxtLink class="NuxtLink" to="/libro_vida" @click="ahref">
						<li
							:class="
								url.startsWith('/libro_vida') ? 'selected' : ''
							"
						>
							<i class="fa-solid fa-book-open" />
							<span>Libro de vida</span>
						</li>
					</NuxtLink>
					<NuxtLink
						v-if="
							(auth.getUserType === UserTypesKeys.STUDENT ||
								auth.getUserType ===
									UserTypesKeys.STUDENT_DIRECTIVE) &&
							voting === 'in progress'
						"
						class="NuxtLink"
						to="/votar"
						@click="ahref"
					>
						<li :class="url.startsWith('/votar') ? 'selected' : ''">
							<i class="fa-solid fa-check-to-slot" />
							<span>Votar</span>
						</li>
					</NuxtLink>
					<NuxtLink
						class="NuxtLink"
						to="/soporte/app/aula_virtual"
						@click="ahref"
					>
						<li
							:class="
								url.startsWith('/soporte') ? 'selected' : ''
							"
						>
							<i class="fa-solid fa-circle-info" />
							<span>Soporte</span>
						</li>
					</NuxtLink>
				</ul>
				<button class="logout" @click="logout">
					<i class="fa-solid fa-arrow-right-from-bracket" />
					Cerrar sesi&oacute;n
				</button>
			</div>
		</menu>
		<MenuNav :toggle-menu="toggleMenu" />
	</div>
</template>

<style lang="scss" scoped>
h2,
i {
	color: var(--color-main);
}

.NuxtLink,
button {
	background-color: transparent;
	border: none;
	font-family: 'Karla', sans-serif;
	color: var(--color-dark);
	text-decoration: none;
	i {
		font-size: 1rem;
	}
}

button {
	color: var(--color-main);
	font-size: 1.1rem;
	cursor: pointer;
}

// Menu
.Menu {
	width: 200px;
	height: 100%;
	top: 0;
	left: 0;
	position: absolute;
	visibility: hidden;
	z-index: 10;
}

.Menu__container {
	width: 250px;
	background-color: white;
	box-shadow: var(--box-shadow);
	left: -250px;
	height: 100%;
	position: fixed;
	top: 0;
	transition: all 0.4s ease;
}

.Menu__header {
	display: flex;
	width: 100%;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 60px;
}

.Menu__header--title {
	display: flex;
	align-items: center;
	gap: 5px;
}

.Opened {
	visibility: visible;
}

.Menu__opened {
	left: 0;
}

.Menu ul {
	padding: 0px 15px;
	list-style: none;
}

.selected {
	color: var(--color-main);
	border-left: 3px solid var(--color-main) !important;
}

.selected i,
.selected span {
	color: var(--color-main);
}

.Menu li {
	padding: 10px;
	cursor: pointer;
	font-size: 1.1rem;
	border-left: 3px solid transparent;
	transition: color 0.4s ease;
	display: flex;
	gap: 10px;
}

.Menu li a {
	display: flex;
	align-items: center;
	gap: 20px;
}

.Menu i,
.Menu span {
	transition: color 0.4s ease;
}

.Menu li:hover i,
.Menu li:hover span,
.Menu li:hover {
	color: var(--color-main);
}

.Menu li:hover {
	border-left: 3px solid var(--color-main);
}

.logout {
	background: none;
	border: none;
	bottom: 25px;
	left: 25px;
	position: absolute;
	color: var(--color-dark);
	font-size: 1.1rem;
	transition: all 0.4s ease;
	cursor: pointer;
}

.logout:hover,
.logout:hover i {
	color: var(--color-main);
}
</style>
