<script lang="ts" setup>
const show = ref(true)

onMounted(() => {
	setTimeout(() => {
		show.value = false
	}, 5000)
})
</script>

<template>
	<Transition>
		<aside v-if="show" class="Offline">
			<p>
				<i class="fa-solid fa-power-off"></i> Listo para trabajar fuera
				de linea
			</p>
		</aside>
	</Transition>
</template>

<style scoped lang="scss">
.Offline {
	position: fixed;
	top: 0px;
	padding: 2px;
	gap: 5px;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	p,
	i {
		color: white;
		font-size: 0.8rem;
	}
	background-color: var(--color-main);
}

.v-enter-active,
.v-leave-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
