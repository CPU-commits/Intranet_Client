<script setup lang="ts">
const { href, title = '' } = defineProps({
	href: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		default: '',
	},
})
</script>

<template>
    <NuxtLink :title="title" class="NuxtLink" :to="href">
        <slot />
    </NuxtLink>
</template>

<style lang="scss" scoped>
    .NuxtLink {
		width: 100%;
		padding: 8px;
		text-decoration: none;
		background-color: var(--color-main);
		border: none;
		color: white;
		transition: all 0.3s ease;
		border-radius: 5px;
	}

	.NuxtLink:hover {
		-webkit-box-shadow: 3px 3px 0 1.5px #3134e1;
		-moz-box-shadow: 3px 3px 0 1.5px #3134e1;
		box-shadow: 3px 3px 0 1.5px #3134e1;
	}
</style>
