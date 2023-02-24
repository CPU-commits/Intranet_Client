<script setup lang="ts">
// Route
const route = useRoute()
const footerEl = ref<HTMLElement | null>(null)

const path = ref(route.path)

watch(
	() => route.path,
	(newValue) => {
		path.value = newValue
	},
)

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
	<footer
		ref="footerEl"
		class="Footer"
		:class="{ Footer__news: path.includes('/noticias') }"
	>
		<div class="Footer__gobernalle">
			<h2>Gobernalle</h2>
			<img src="/img/gobernalle.png" alt="Gobernalle Logo" />
			<span>Un producto de Gobernalle</span>
		</div>
	</footer>
</template>

<style lang="scss" scoped>
.Footer {
	position: absolute;
	width: 100%;
	height: 200px;
	bottom: var(--bottom);
	background-color: var(--color-main);
	box-shadow: var(--box-shadow);
	display: flex;
	justify-content: space-around;
	z-index: -1;
}

.Footer__news {
	background-color: var(--color-news-black);
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
