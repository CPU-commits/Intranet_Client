<script setup lang="ts">
const footerEl = ref<HTMLElement | null>(null)

onMounted(() => {
	// Observe resize
	new ResizeObserver(() => {
		if (document.body.clientHeight < window.innerHeight)
			footerEl.value?.style.setProperty('--bottom', '0')
		else footerEl.value?.style.setProperty('--bottom', 'initial')
	}).observe(document.body)
	// Init value
	if (document.body.clientHeight < window.innerHeight)
		footerEl.value?.style.setProperty('--bottom', '0')
})
</script>

<template>
	<footer ref="footerEl" class="Footer">
		<div class="Footer__gobernalle">
			<h2>Gobernalle</h2>
			<img src="/img/gobernalle.png" alt="Gobernalle Logo" />
			<span>Un producto de Gobernalle</span>
		</div>
	</footer>
</template>

<style lang="scss">
.Footer {
	position: absolute;
	width: 100%;
	height: 200px;
	bottom: var(--bottom);
	background-color: var(--color-main);
	box-shadow: var(--box-shadow);
	display: flex;
	justify-content: space-around;
}

.Footer__gobernalle {
	display: flex;
	flex-direction: column;
	align-items: center;
	h2 {
		color: white;
	}
	span {
		font-style: italic;
		color: white;
	}
	justify-content: center;
}

img {
	object-fit: contain;
	height: 140px;
}
</style>
