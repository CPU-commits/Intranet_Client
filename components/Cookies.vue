<script lang="ts" setup>
import { CONSENT_LOCAL } from '~~/common/cookies'

// Router
const route = useRoute()
// Stores
const consent = useConsent()
const closed = ref(false)

const path = ref(route.path)

watch(
	() => route.path,
	(newValue) => {
		path.value = newValue
	},
)

function setConsent(hasConsent: boolean) {
	localStorage.setItem(CONSENT_LOCAL, String(hasConsent))
	consent.value = hasConsent
	closed.value = true
}
</script>

<template>
	<aside v-if="!consent && path === '/' && !closed" class="Cookies">
		<header>
			<h3>
				<i class="fa-solid fa-cookie"></i> Consentimiento de Cookies
			</h3>
		</header>
		<p>
			Este sitio Web almacena Cookies propias. Las cookies en este sitio
			se usan para almacenar tu sesi&oacute;n, en caso de rechazar las
			cookies no podr&aacute;s usar la aplicaci&oacute;n. Si acepta o
			continúa navegando, consideramos que acepta su uso. Puede cambiar la
			configuración u obtener más información
			<NuxtLink to="/cookies"> aquí </NuxtLink>
		</p>
		<footer>
			<HTMLButton :click="() => setConsent(true)" type="button">
				Consentir
			</HTMLButton>
			<HTMLButton :click="() => setConsent(false)" type="button">
				Rechazar
			</HTMLButton>
		</footer>
	</aside>
</template>

<style scoped>
.dark-mode .Cookies {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Cookies {
	box-shadow: var(--box-shadow);
}

.Cookies {
	position: fixed;
	bottom: 0;
	min-height: 150px;
	width: 100%;
	padding: 10px;
	background-color: white;
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
	display: flex;
	gap: 8px;
	box-sizing: border-box;
	flex-direction: column;
	justify-content: space-evenly;
	align-items: center;
}

header {
	width: 100%;
}

h3 {
	font-size: 1.4rem;
}

p {
	width: 100%;
}

footer {
	display: flex;
	max-width: 500px;
	width: 100%;
	justify-content: center;
	gap: 10px;
}

@media (max-width: 767.98px) {
	h3 {
		font-size: 1.1rem;
	}

	p {
		font-size: 0.9rem;
	}
}
</style>
