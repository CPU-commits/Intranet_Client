<script setup lang="ts">
// Types
import type { ItemQuestionType, ItemType } from '~~/models/form/item.model'
import { intToRoman } from '~~/utils/format'
// Stores
const buildForm = useBuildFormStore()

// Props
defineProps<{
	number: number
	item: Omit<ItemType, 'questions'> & {
		questions: Array<Omit<ItemQuestionType, 'answer'>>
	}
}>()
</script>

<template>
	<article class="Item">
		<div class="Item__checked">
			<input
				v-model="buildForm.checked"
				:value="number"
				type="radio"
				@change="() => buildForm.changeItem(item)"
			/>
		</div>
		<section class="Item__content">
			<header class="Item__header">
				<h4>{{ intToRoman(number + 1) }}.</h4>
				<HTMLInput
					id="title"
					:value="item.title"
					placeholder="Titulo"
				/>
			</header>
			<template v-if="buildForm.getType === 'true'">
				<label for="score">Asignaci&oacute;n de puntaje</label>
				<HTMLSelect id="score" value="item.points_type">
					<option value="">
						Seleccionar una distribuci&oacute;n
					</option>
					<option value="equal">
						Puntaje distribuido equitativamente
					</option>
					<option value="custom">Puntaje personalizado</option>
				</HTMLSelect>
				<div v-if="item.points_type === 'equal'" class="Equal">
					<HTMLInput
						id="points"
						value="item.points"
						type="number"
						placeholder="Puntaje total a distribuir"
					/>
				</div>
			</template>
		</section>
		<aside class="Item__destroy">
			<HTMLButtonIcon
				:click="() => buildForm.deleteItem(number)"
				class-item="fa-solid fa-xmark"
			/>
		</aside>
	</article>
</template>

<style scoped>
.Item {
	padding: 10px;
	border-bottom: 1px solid var(--color-light);
	display: flex;
	width: 100%;
	box-sizing: border-box;
	align-items: center;
	gap: 10px;
}

.Item__content {
	width: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.Item__header {
	display: flex;
	width: 100%;
	box-sizing: border-box;
	align-items: center;
}

h4 {
	font-family: 'Inconsolata', monospace;
}

.Equal {
	max-width: 300px;
	width: 100%;
	align-self: center;
}

.Item__destroy {
	margin-left: 20px;
}

@media (max-width: 575.98px) {
	.Item {
		gap: 5px;
		padding: 8px;
	}

	.Item__destroy {
		margin-left: 10px;
	}

	h4 {
		font-size: 0.9rem;
	}
}
</style>
