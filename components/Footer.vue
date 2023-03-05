<script setup lang="ts">
// Route
const route = useRoute()

const path = ref(route.path)

watch(
	() => route.path,
	(newValue) => {
		path.value = newValue
	},
)
</script>

<template>
	<footer
		class="Footer"
		:class="{ Footer__news: path.startsWith('/noticias') }"
	>
		<div class="Footer__gobernalle">
			<h2>Gobernalle Intranet</h2>
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
	bottom: 0;
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
