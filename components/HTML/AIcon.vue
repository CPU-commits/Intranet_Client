<script setup lang="ts">
withDefaults(
	defineProps<{
		classItem: string
		title?: string
		href: string
		active?: boolean
		target?: string
	}>(),
	{ active: false, title: '', target: '' },
)
</script>

<template>
	<NuxtLink class="NuxtLink" :to="href" :title="title" :target="target">
		<i :class="`${classItem} ${active ? 'Actived' : ''}`" />
	</NuxtLink>
</template>

<style scoped>
.NuxtLink {
	display: flex;
	justify-content: center;
	text-decoration: none;
	background: transparent;
	border: none;
	width: 100%;
}

.NuxtLink:hover i {
	color: var(--color-main);
}

i {
	font-size: 1rem;
	transition: all 0.4s ease;
}

.Actived {
	color: var(--color-main);
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
