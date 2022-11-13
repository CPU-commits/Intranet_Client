<script setup lang="ts">
// Props
const { stars } = defineProps<{
    stars: number
}>()
</script>

<template>
    <div class="Rating" :title="stars === 0 ? 'Sin opiniones' : ''">
        <i
            v-for="(_, i) in 5"
            :class="`${stars === 0 ? 'Without' : ''} ${i < stars ? 'Star' : ''}`"
            class="fa-solid fa-star"
        />
    </div>
</template>

<style scoped>
	.Rating {
		display: flex;
		gap: 5px;
	}

	.Star {
		color: var(--color-star);
	}

	.Without {
		color: var(--color-light);
	}

	@media (max-width: 767.98px) {
		i {
			font-size: 0.9rem;
		}
	}
</style>
