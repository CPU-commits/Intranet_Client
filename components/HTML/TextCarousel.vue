<script lang="ts" setup>
const props = defineProps<{
	labels: Array<{
		text: string
		value: string
	}>
}>()

const emits = defineEmits<{
	(e: 'update:select', v: string): void
}>()

// Form
const carousel = ref<HTMLElement | null>(null)
const selected = ref(0)
const isShow = ref(false)

onMounted(() => {
	emits('update:select', props.labels.at(0)?.value ?? '')
})

function move(isNext = true) {
	carousel.value?.scrollTo({
		left: isNext
			? carousel.value?.scrollLeft + (carousel.value?.offsetWidth - 100)
			: carousel.value?.scrollLeft - (carousel.value?.offsetWidth - 100),
		behavior: 'smooth',
	})
}
</script>

<template>
	<div
		class="Container"
		@mouseover="isShow = true"
		@mouseleave="isShow = false"
	>
		<Transition>
			<HTMLButtonIcon
				v-if="isShow"
				:one-hundred="false"
				:click="() => move(false)"
				class-item="fa-solid fa-chevron-left"
			/>
		</Transition>
		<section ref="carousel" class="Carousel">
			<article v-for="(label, i) in labels" :key="i" class="Label">
				<HTMLButtonText
					:class="{ Selected: selected === i }"
					:click="
						() => {
							$emit('update:select', label.value)
							selected = i
						}
					"
					color="var(--color-dark)"
				>
					{{ label.text }}
				</HTMLButtonText>
			</article>
		</section>
		<Transition>
			<HTMLButtonIcon
				v-if="isShow"
				:one-hundred="false"
				:click="move"
				class-item="fa-solid fa-chevron-right"
			/>
		</Transition>
	</div>
</template>

<style scoped lang="scss">
.v-enter-active,
.v-leave-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

.Container {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.Carousel {
	display: flex;
	gap: 10px;
	padding: 10px 30px;
	border-radius: 50px;
	overflow: hidden;
	position: relative;
	align-items: center;
	transition: all 0.4s ease;
}

.light-mode .Container:hover .Carousel {
	box-shadow: var(--box-shadow);
}

.Label {
	padding: 5px;
	border-radius: 8px;
	white-space: nowrap;
}

.light-mode .HTMLButtonIcon {
	background-color: white;
}

.dark-mode .HTMLButtonIcon {
	background-color: var(--color-main-dark);
}

.HTMLButtonIcon {
	position: absolute;
	z-index: 9;
	border-radius: 60%;
	padding: 5px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.Container .HTMLButtonIcon:first-child {
	left: 10px;
}

.Container .HTMLButtonIcon:last-child {
	right: 10px;
}

.Selected {
	font-weight: bold;
	color: var(--color-main);
}

@media (max-width: 575.98px) {
	.Carousel {
		padding: 10px;
	}
}
</style>
