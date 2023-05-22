<script lang="ts" setup>
withDefaults(
	defineProps<{
		large?: boolean
	}>(),
	{ large: false },
)

// Color
const colorMode = useColorMode()

const colors = {
	system: 'fa-solid fa-desktop',
	light: 'fa-solid fa-sun',
	dark: 'fa-solid fa-moon',
}

function changeColor() {
	if (colorMode.preference === 'system') colorMode.preference = 'light'
	else if (colorMode.preference === 'light') colorMode.preference = 'dark'
	else if (colorMode.preference === 'dark') colorMode.preference = 'system'
}

const colorName = computed(() => {
	if (colorMode.preference === 'system') return 'Sistema'
	if (colorMode.preference === 'light') return 'Luz'
	return 'Oscuro'
})
</script>

<template>
	<div class="Color">
		<HTMLButtonIcon
			:click="changeColor"
			:class-item="colors[colorMode.preference]"
		>
			<span v-if="large">{{ colorName }}</span>
		</HTMLButtonIcon>
	</div>
</template>

<style scoped>
.Color {
	display: flex;
}

button {
	width: fit-content;
}
</style>
