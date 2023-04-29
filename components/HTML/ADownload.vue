<script setup lang="ts">
defineProps<{
	classItem: string
	href: string
}>()
</script>

<template>
	<a :href="href" download>
		<i :class="`${classItem}`" />
	</a>
</template>

<style scoped>
a {
	display: flex;
	justify-content: center;
	text-decoration: none;
	background: transparent;
	border: none;
	width: 100%;
}

a:hover i {
	color: var(--color-main);
}

i {
	font-size: 1rem;
	transition: all 0.4s ease;
}

@media (max-width: 767.98px) {
	i {
		font-size: 0.8rem;
	}
}

@media (max-width: 575.98px) {
	i {
		font-size: 0.72rem;
	}
}
</style>
