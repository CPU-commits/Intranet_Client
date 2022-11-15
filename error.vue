<script setup lang="ts">
// Types
import type { ErrorFetch } from './common/fetchModule'
// Router
const router = useRouter()

const originalError = useError().value
const err = ref<ErrorFetch>({
	message: originalError.message,
	statusCode: 500,
	success: false,
})
if ('statusCode' in originalError) {
	err.value.statusCode = Number(originalError.statusCode)
}

const handleError = () =>
	clearError({
		redirect: '/',
	})
const reload = () => {
	window.location.reload()
}
const back = () => {
	router.back()
}

const src = ref('/img/error/500.svg')
const message = ref('Ha ocurrido un error')

if (err.value.statusCode === 400) {
	src.value = '/img/error/400.svg'
	message.value = 'Ups... Parece que algo se olvidó'
} else if (err.value.statusCode === 401) {
	src.value = '/img/error/401.svg'
	message.value = 'No estás autorizado a esta ruta'
} else if (err.value.statusCode === 403) {
	src.value = '/img/error/403.svg'
	message.value = 'Parece que esta ruta ya no existe'
} else if (err.value.statusCode === 404) {
	src.value = '/img/error/404.svg'
	message.value = 'Esta ruta no existe'
}
</script>

<template>
	<section class="Error">
		<section class="Error__message">
			<h1>{{ message }}</h1>
			<span v-if="err.statusCode !== 404">
				{{ err.message }}
			</span>
			<button @click="reload">
				<i class="fa-solid fa-rotate-right" /> Recargar p&aacute;gina
			</button>
			<button @click="back">
				<i class="fa-solid fa-circle-arrow-left" /> Volver atras
			</button>
			<button @click="handleError">
				<i class="fa-solid fa-house" /> Volver a la p&aacute;gina
				principal
			</button>
		</section>

		<img :src="src" alt="dsf" />
	</section>
</template>

<style scoped>
.Error {
	display: grid;
	grid-template-columns: 1fr 1fr;
	position: absolute;
	height: 100%;
}

.Error__message {
	background-color: var(--color-main);
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	padding: 10px;
	padding-bottom: 100px;
	gap: 5px;
}

h1 {
	color: white;
	font-size: 3.5rem;
	text-align: center;
}

span {
	color: white;
	font-size: 1.5rem;
}

i {
	color: var(--color-main);
}

button {
	background-color: transparent;
	border: none;
	color: var(--color-main);
	background-color: white;
	padding: 5px;
	border-radius: 8px;
}

img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
</style>
