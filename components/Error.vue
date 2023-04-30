<script setup lang="ts">
// Types
import type { Ref } from 'vue'
import { ErrorFetch, ERROR_ABORT } from '~~/common/fetchModule'

// eslint-disable-next-line vue/no-setup-props-destructure
const { err } = defineProps<{
	err: ErrorFetch
}>()

const src: Ref<string> = ref('/img/error/500.svg')
const message = handleErrorMessage(err.message, err.statusCode)

if (err.statusCode === 400) {
	src.value = '/img/error/400.svg'
} else if (err.statusCode === 401) {
	src.value = '/img/error/401.svg'
} else if (err.statusCode === 403) {
	src.value = ''
} else if (err.statusCode === 410) {
	src.value = '/img/error/403.svg'
} else if (err.statusCode === 404) {
	src.value = '/img/error/404.svg'
}

function reloadPage() {
	window.location.reload()
}
</script>

<template>
	<section v-if="err.message !== ERROR_ABORT" class="Error">
		<h2>{{ message }}</h2>

		<span v-if="err.statusCode !== 404">{{ err.message }}</span>
		<NuxtImg :src="src" :alt="message" />

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
