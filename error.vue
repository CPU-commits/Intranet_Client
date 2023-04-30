<script setup lang="ts">
// Types
import type { ErrorFetch } from './common/fetchModule'
// Router
const router = useRouter()

const originalError = useError().value
const err = ref<ErrorFetch>({
	message: originalError?.message ?? 'Error inesperado',
	statusCode: 500,
	success: false,
})
if (originalError && 'statusCode' in originalError) {
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
const message = handleErrorMessage('fetch', err.value.statusCode)

if (err.value.statusCode === 400) {
	src.value = '/img/error/400.svg'
} else if (err.value.statusCode === 401) {
	src.value = '/img/error/401.svg'
} else if (err.value.statusCode === 403) {
	src.value = '/img/error/403.svg'
} else if (err.value.statusCode === 404) {
	src.value = '/img/error/404.svg'
}
</script>

<template>
	<main>
		<Menu />
		<section class="Error">
			<section class="Error__message">
				<h1>{{ message }}</h1>
				<span v-if="err.statusCode !== 404">
					{{ err.message }}
				</span>
				<button type="button" @click="reload">
					<i class="fa-solid fa-rotate-right" /> Recargar
					p&aacute;gina
				</button>
				<button type="button" @click="back">
					<i class="fa-solid fa-circle-arrow-left" /> Volver atras
				</button>
				<button type="button" @click="handleError">
					<i class="fa-solid fa-house" /> Volver a la p&aacute;gina
					principal
				</button>
			</section>

			<img :src="src" alt="Imagen" />
		</section>
		<Footer />
	</main>
</template>

<style scoped>
.Error {
	display: flex;
	align-items: center;
	justify-content: center;
}

.Error__message {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	padding: 10px;
	gap: 5px;
}

h1 {
	color: var(--color-main);
	font-size: 2rem;
	max-width: 500px;
	text-align: center;
}

span {
	color: white;
	font-size: 1.5rem;
}

i {
	color: white;
}

button {
	background-color: transparent;
	border: none;
	color: white;
	background-color: var(--color-main);
	padding: 5px;
	border-radius: 8px;
}

img {
	width: 100%;
	max-width: 600px;
	object-fit: contain;
}

@media (max-width: 998px) {
	.Error {
		flex-direction: column;
	}

	h1 {
		font-size: 2.5rem;
	}

	img {
		margin-bottom: 300px;
	}
}

@media (max-width: 575.98px) {
	h1 {
		font-size: 1.5rem;
	}

	span,
	button {
		font-size: 0.8rem;
	}
}
</style>
