<script setup lang="ts">
import { UserTypesKeys } from '~~/models/user/user.model'

defineProps<{
	toggleMenu: () => void
}>()
// Stores
const auth = useAuthStore()
const config = useRuntimeConfig()
// Router
const route = useRoute()

const shortName = config.public.SHORT_NAME.toUpperCase()
const url = ref(route.path)
watch(
	() => route.path,
	(newValue) => {
		url.value = newValue
	},
)
</script>

<template>
	<nav class="Header" :class="url.startsWith('/noticias') ? 'News' : ''">
		<section class="Header__content">
			<div class="Header__content--left">
				<button
					v-if="auth.getIsAuth"
					class="InvisibleButton"
					@click="toggleMenu"
				>
					<i class="fa-solid fa-bars" />
				</button>
				<NuxtLink
					class="NuxtLink"
					:to="auth.getIsAuth ? '/inicio' : '/'"
				>
					<h2>{{ shortName }} Intranet</h2>
				</NuxtLink>
			</div>
			<div v-if="auth.isAuth" class="Header__content--main">
				<ul>
					<li
						v-if="
							auth.getUserType === UserTypesKeys.TEACHER ||
							auth.getUserType === UserTypesKeys.STUDENT ||
							auth.getUserType === UserTypesKeys.STUDENT_DIRECTIVE
						"
					>
						<NuxtLink class="NuxtLink" to="/aula_virtual">
							Aula virtual
						</NuxtLink>
					</li>
					<li>
						<NuxtLink class="NuxtLink" to="/noticias">
							Noticias
						</NuxtLink>
					</li>
					<li>
						<NuxtLink class="NuxtLink" to="/biblioteca">
							Biblioteca
						</NuxtLink>
					</li>
				</ul>
			</div>
			<ClientOnly>
				<div class="Header__content--right">
					<Notifications v-if="auth.isAuth" />
					<NuxtLink v-if="auth.isAuth" class="NuxtLink" to="/usuario">
						<i class="fa-solid fa-user" />
					</NuxtLink>
					<NuxtLink
						v-if="
							auth.getUserType === UserTypesKeys.DIRECTOR ||
							auth.getUserType === UserTypesKeys.DIRECTIVE ||
							auth.getUserType === UserTypesKeys.LIBRARIAN
						"
						class="NuxtLink"
						to="/admin"
					>
						<i class="fa-solid fa-gear" />
					</NuxtLink>
					<NuxtLink
						v-if="!auth.isAuth"
						title="¿Necesitas ayuda?"
						to="/soporte/acceso"
					>
						<i class="fa-solid fa-circle-info" />
					</NuxtLink>
				</div>
			</ClientOnly>
		</section>
	</nav>
</template>

<style lang="scss" scoped>
.Header {
	width: 100%;
	height: 60px;
	box-shadow: rgb(71 75 255 / 10%) 0px 2px 4px;
	z-index: 10;
	background-color: white;
}
/* News */
.News {
	background-color: var(--color-news-black);
	h2,
	i,
	a {
		color: white;
	}
}

h2,
i {
	color: var(--color-main);
}

.Header__content {
	box-sizing: border-box;
	padding: 0 20px;
	width: 100%;
	height: 100%;
	justify-content: space-around;
	display: flex;
}

.Header__content--left {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 10px;
	width: fit-content;
	max-width: 220px;
	min-width: 200px;
	h2 {
		text-align: center;
	}
}

.Header__content--main {
	display: flex;
	justify-content: center;
	width: 200px;
}

.Header__content--main ul {
	align-items: center;
	gap: 20px;
	list-style: none;
	display: flex;
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

.Header__content--right {
	display: flex;
	align-items: center;
	gap: 20px;
	width: 200px;
	justify-content: center;
}

button {
	color: var(--color-main);
	font-size: 1.1rem;
	cursor: pointer;
}

// Media queries
@media (max-width: 767.98px) {
	.Header {
		height: 50px;
	}

	h2 {
		font-size: 1.3rem;
	}

	a {
		font-size: 0.85rem;
	}

	.Header__content--left {
		width: fit-content;
	}

	.Header__content--right {
		justify-content: flex-end;
		width: 100px;
		gap: 15px;
		i {
			font-size: 0.9rem;
		}
	}
}

@media (max-width: 575.98px) {
	.Header {
		height: 45px;
	}

	.Header__content {
		padding: 0 8px;
	}

	h2 {
		font-size: 1.1rem;
	}

	button i {
		font-size: 0.9rem;
	}

	a {
		font-size: 0.75rem;
	}

	.Header__content--left {
		gap: 5px;
	}

	.Header__content--main {
		display: none;
	}

	.Header__content--right {
		width: fit-content;
		gap: 15px;
		i {
			font-size: 0.8rem;
		}
	}
}
</style>
