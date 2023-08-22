<script lang="ts" setup>
defineProps<{
	classItem: string
	message: string
}>()
</script>

<template>
	<aside class="TDAside" :title="message">
		<i :class="classItem" />
		<span>{{ message }}</span>
	</aside>
</template>

<style scoped lang="scss">
.TDAside {
	position: absolute;
	left: -10px;
	margin-top: 13px;
	border-radius: 60%;
	width: 20px;
	height: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: var(--color-main);
	transition: all 0.2s ease;
	cursor: default;
	i {
		color: white;
	}
	span {
		position: absolute;
		left: 100%;
		top: 50%;
		margin-left: 0.5em;
		padding: 1em;
		background-color: var(--color-main-dark);
		color: white;
		font-size: 0.6rem;
		line-height: 1.6;
		text-align: left;
		opacity: 0;
		white-space: nowrap;
		transform: translate(-10px, -15px);
		transition: all 0.15s ease-in-out;
		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 35%;
			width: 0;
			height: 0;
			border: 0.5em solid transparent;
			border-right-color: var(--color-main-dark);
			transform: translate(-100%);
		}
	}
}

.TDAside:hover {
	-webkit-box-shadow: 0 4px 0 0 var(--color-main-dark);
	-moz-box-shadow: 0 4px 0 0 var(--color-main-dark);
	box-shadow: 0 4px 0 0 var(--color-main-dark);
	span {
		opacity: 1;
		transform: translate(0px, -15px);
	}
}
</style>
