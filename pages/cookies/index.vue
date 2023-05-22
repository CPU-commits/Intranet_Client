<script lang="ts" setup>
import { CONSENT_LOCAL } from '~~/common/cookies'

definePageMeta({
	auth: false,
})

function setConsent(hasConsent: boolean) {
	localStorage.setItem(CONSENT_LOCAL, String(hasConsent))
	const consent = useConsent()
	consent.value = hasConsent
}
</script>

<template>
	<section class="Cookies">
		<div class="Cookies__content">
			<h1><i class="fa-solid fa-cookie"></i> Cookies</h1>
			<article>
				<h2>¿Qu&eacute; son las cookies?</h2>
				<p>
					Una cookie es un fichero que se descarga en su ordenador al
					acceder a determinadas p&aacute;ginas web. Las cookies
					permiten a una p&aacute;gina web, entre otras cosas,
					almacenar y recuperar informaci&oacute;n sobre los
					h&aacute;bitos de navegaci&oacute;n de un usuario o de su
					equipo y, dependiendo de la informaci&oacute;n que contengan
					y de la forma en que utilice su equipo, pueden utilizarse
					para reconocer al usuario.
				</p>
			</article>
			<article>
				<h2>
					¿Qu&eacute; tipos de cookies utiliza esta p&aacute;gina web?
				</h2>
				<p>
					Cookies t&eacute;cnicas: Son aquellas que permiten al
					usuario la navegaci&oacute;n a trav&eacute;s del &aacute;rea
					restringida y la utilizaci&oacute;n de sus diferentes
					funciones, como por ejemplo, llevar a cambio el proceso de
					compra de un art&iacute;culo.
				</p>
			</article>
			<article>
				<h2>Desactivar las cookies.</h2>
				<p>
					Puede usted permitir, bloquear o eliminar las cookies
					instaladas en su equipo mediante la configuraci&oacute;n de
					las opciones del navegador instalado en su ordenador. En la
					mayor&iacute;a de los navegadores web se ofrece la
					posibilidad de permitir, bloquear o eliminar las cookies
					instaladas en su equipo. A continuaci&oacute;n puede acceder
					a la configuraci&oacute;n de los navegadores webs m&aacute;s
					frecuentes para aceptar, instalar o desactivar las cookies:
				</p>
				<ul>
					<li>
						<NuxtLink
							to="https://support.google.com/chrome/answer/95647?hl=es"
							target="_blank"
							rel="external"
						>
							Configurar cookies en Google Chrome
						</NuxtLink>
					</li>
					<li>
						<NuxtLink
							to="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
							target="_blank"
							rel="external"
						>
							Configurar cookies en Microsoft Edge
						</NuxtLink>
					</li>
					<li>
						<NuxtLink
							to="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias?redirectlocale=es&redirectslug=habilitar-y-deshabilitar-cookies-que-los-sitios-we"
							target="_blank"
							rel="external"
						>
							Configurar cookies en Mozilla Firefox
						</NuxtLink>
					</li>
					<li>
						<NuxtLink
							to="https://support.apple.com/es-es/HT201265"
							target="_blank"
							rel="external"
						>
							Configurar cookies en Safari (Apple)
						</NuxtLink>
					</li>
				</ul>
			</article>
			<article>
				<h2>Activar - Desactivar cookies de este sitio web</h2>
				<footer>
					<HTMLButton type="button" :click="() => setConsent(true)">
						<i class="fa-solid fa-cookie"></i> Activar
					</HTMLButton>
					<HTMLButton type="button" :click="() => setConsent(false)">
						<i class="fa-solid fa-cookie-bite"></i> Desactivar
					</HTMLButton>
				</footer>
			</article>
		</div>
	</section>
</template>

<style scoped>
.Cookies {
	margin: 30px;
	box-sizing: border-box;
}

.dark-mode .Cookies__content {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Cookies__content {
	box-shadow: var(--box-shadow);
}

.Cookies__content {
	display: flex;
	flex-direction: column;
	gap: 30px;
	background-color: var(--color-main-light-contrast);
	box-sizing: border-box;
	border-radius: 8px;
	padding: 25px;
	max-width: 1000px;
}

p {
	padding: 15px;
}

ul {
	padding: 20px;
	list-style: none;
}

li {
	padding: 10px;
}

h1 {
	font-size: 2rem;
}

h2,
h1,
i,
a {
	color: var(--color-main);
}

button i {
	color: white;
}

footer {
	padding: 20px;
	display: flex;
	gap: 20px;
	max-width: 500px;
}

@media (max-width: 767.98px) {
	.Cookies {
		margin: 10px;
	}

	.Cookies__content {
		gap: 20px;
	}

	h1 {
		font-size: 1.5rem;
	}

	h2 {
		font-size: 1.2rem;
	}

	p {
		padding: 10px;
	}

	ul {
		padding: 12px;
	}
}
</style>
