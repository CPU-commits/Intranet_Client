<script setup lang="ts">
const { checked, id } = withDefaults(defineProps<{
    checked: boolean
    id?: string
}>(), { id: '' })
</script>

<template>
    <div class="item">
        <div class="toggle-pill-color">
            <input
				type="checkbox"
				:id="id"
				:checked="checked"
				@change="$emit('update:checked', ($event.target as HTMLInputElement).checked)"
			/>
            <label :for="id" />
        </div>
    </div>
</template>

<style scoped>
	.item {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.toggle-pill-color input[type='checkbox'] {
		display: none;
	}

	.toggle-pill-color input[type='checkbox'] + label {
		display: block;
		position: relative;
		width: 3em;
		height: 1.6em;
		margin-bottom: 20px;
		border-radius: 1em;
		background: var(--color-danger);
		box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.3);
		cursor: pointer;
		-webkit-transition: background 0.1s ease-in-out;
		transition: background 0.1s ease-in-out;
	}

	.toggle-pill-color input[type='checkbox'] + label:before {
		content: '';
		display: block;
		width: 1.2em;
		height: 1.2em;
		border-radius: 1em;
		background: #fff;
		box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.2);
		position: absolute;
		left: 0.2em;
		top: 0.2em;
		-webkit-transition: all 0.2s ease-in-out;
		transition: all 0.2s ease-in-out;
	}

	.toggle-pill-color input[type='checkbox']:checked + label {
		background: var(--color-main);
	}

	.toggle-pill-color input[type='checkbox']:checked + label:before {
		box-shadow: -2px 0px 5px rgba(0, 0, 0, 0.2);
		left: 1.6em;
	}
</style>
