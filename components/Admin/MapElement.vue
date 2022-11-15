<script setup lang="ts">
// Types
import type { Section } from '~~/models/course/course.model'
defineProps<{
	course: string
	grade: number
	sections: Array<Section>
}>()
</script>

<template>
	<div>
		<article>
			<span>
				{{ course }}
				({{ grade }}°) [<span v-for="(section, i) in sections" :key="i">
					{{ section.section }}
					<span v-if="i !== sections.length - 1">,</span> </span
				>]
			</span>
		</article>
		<slot />
	</div>
</template>

<style lang="scss" scoped>
div {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

article {
	width: 300px;
	height: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--color-main);
	padding: 10px;
	border-radius: 20px;
	span {
		color: white;
	}
}

@media (max-width: 575.98px) {
	article {
		width: 200px;
		height: 30px;
		font-size: 0.8rem;
	}
}
</style>
