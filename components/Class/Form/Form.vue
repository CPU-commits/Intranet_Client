<script setup lang="ts">
function up() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth',
	})
}
</script>

<template>
	<div class="Container">
		<section class="Form">
			<slot />
		</section>
		<aside class="Questions">
			<slot name="questions" />
		</aside>
		<button class="Up" @click="up">
			<i class="fa-solid fa-angles-up" />
		</button>
	</div>
</template>

<style scoped>
.Container {
	display: grid;
	width: 100%;
	grid-template-columns: 5fr 1fr;
	margin: 20px;
	gap: 15px;
	height: fit-content;
}

.dark-mode .Form {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Form {
	box-shadow: var(--box-shadow);
}

.Form {
	background-color: white;
	padding: 15px;
	border-radius: 10px;
}

.Up {
	display: none;
	position: fixed;
	bottom: 10px;
	right: 10px;
	width: 30px;
	height: 30px;
	border-radius: 100%;
	border: none;
	background-color: var(--color-main);
}

.Up i {
	color: white;
	font-size: 0.8rem;
}

@media (max-width: 767.98px) {
	.Container {
		margin: 15px;
	}

	.Form {
		padding: 10px;
	}
}

@media (max-width: 575.98px) {
	.Container {
		margin: 5px;
		padding: 5px;
		display: flex;
		flex-direction: column-reverse;
	}

	.Up {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.Form {
		padding: 8px;
	}
}
</style>
