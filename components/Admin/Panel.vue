<script setup lang="ts">
// Types
import type { Ref } from 'vue'
// Props
const props = defineProps({
	nav: {
		type: Boolean,
		default: true,
	},
})

const content: Ref<HTMLElement | null> = ref(null)

onMounted(() => {
	if (!props.nav && content.value) content.value.style.marginTop = '0px'
})
</script>

<template>
	<section class="Panel">
		<nav v-if="nav">
			<slot name="nav" />
		</nav>
		<br v-if="nav" />
		<div ref="content" class="Panel__content">
			<slot />
		</div>
	</section>
</template>

<style lang="scss" scoped>
.dark-mode .Panel {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Panel {
	box-shadow: var(--box-shadow);
}

.Panel {
	width: 100%;
	padding: 20px;
	border-radius: 10px;
	overflow: auto;
	background-color: white;
	height: fit-content;
}

.Panel__content {
	margin-top: 20px;
	display: flex;
	flex-direction: column;
}

nav {
	box-sizing: border-box;
	padding: 10px;
	width: 100%;
	border: 2px solid var(--color-main);
}

// Media queries
@media (max-width: 767.98px) {
	nav {
		padding: 7px;
	}

	.Panel {
		padding: 15px;
	}

	.Panel__content {
		margin-top: 0px;
	}
}

@media (max-width: 575.98px) {
	.Panel {
		padding: 10px;
	}
}
</style>
