<script setup lang="ts">
withDefaults(
	defineProps<{
		scope?: string
	}>(),
	{ scope: 'default' },
)

// Composable
const spinnerGet = useSpinnerGet()
const scopeSpinner = useScopeSpinner()
</script>

<template>
	<div v-if="scope && scopeSpinner.get(scope) && spinnerGet" class="lds-ring">
		<div />
		<div />
		<div />
		<div />
	</div>
</template>

<style scoped>
.lds-ring {
	display: flex;
	justify-content: center;
	position: relative;
	width: 100%;
	height: 80px;
	font-family: initial;
}
.lds-ring div {
	box-sizing: border-box;
	display: block;
	position: absolute;
	width: 64px;
	height: 64px;
	margin: 8px;
	border: 8px solid var(--color-main);
	border-radius: 50%;
	animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	border-color: var(--color-main) transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
	animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
	animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
	animation-delay: -0.15s;
}
@keyframes lds-ring {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@media (max-width: 767.98px) {
	.lds-ring div {
		height: 60px;
		width: 60px;
	}
}
</style>
