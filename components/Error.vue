<script setup lang="ts">
// Types
import type { Ref } from 'vue'
import { ErrorFetch, ERROR_ABORT } from '~~/common/fetchModule'

// eslint-disable-next-line vue/no-setup-props-destructure
const { err } = defineProps<{
	err: ErrorFetch
}>()

const src: Ref<string> = ref('/img/error/500.svg')
const message: Ref<string> = ref('Ha ocurrido un error')

if (err.statusCode === 400) {
	src.value = '/img/error/400.svg'
	message.value = 'Ups... Parece que algo se olvidó'
} else if (err.statusCode === 401) {
	src.value = '/img/error/401.svg'
	message.value = 'No estás autorizado a esta ruta'
} else if (err.statusCode === 403) {
	src.value = '/img/error/403.svg'
	message.value = 'Parece que esta ruta ya no existe'
} else if (err.statusCode === 404) {
	src.value = '/img/error/404.svg'
	message.value = 'Esta ruta no existe'
}

function reloadPage() {
	window.location.reload()
}
</script>

<template>
	<section v-if="err.message !== ERROR_ABORT" class="Error">
		<h2>{{ message }}</h2>

		<span v-if="err.statusCode !== 404">{{ err.message }}</span>
		<img :src="src" :alt="message" />

		<HTMLButtonText :click="reloadPage">
			<i class="fa-solid fa-arrows-rotate"></i>
			Recargar pagina
		</HTMLButtonText>
	</section>
</template>

<style scoped>
.Error {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 5px;
}

h2,
i {
	color: var(--color-main);
}

img {
	width: 100%;
	height: 300px;
}
</style>
