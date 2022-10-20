<script setup lang="ts">
// Types
import type { ItemQuestionType, ItemType } from '~~/models/form/item.model';
import { intToRoman } from '~~/utils/format'
// Stores
const buildForm = useBuildFormStore()

// Props
const { number, item } = defineProps<{
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
                @change="() => buildForm.changeItem(item)"
                v-model="buildForm.checked"
                :value="number"
                type="radio"
            />
        </div>
        <section class="Item__content">
            <header class="Item__header">
                <h4>{{ intToRoman(number + 1) }}.</h4>
                <HTMLInput placeholder="Titulo" v-model:value="item.title" id="title" />
            </header>
            <template v-if="buildForm.getType === 'true'">
                <label for="score">Asignaci&oacute;n de puntaje</label>
                <HTMLSelect id="score" v-model:value="item.points_type">
                    <option value="">Seleccionar una distribuci&oacute;n</option>
                    <option value="equal">Puntaje distribuido equitativamente</option>
                    <option value="custom">Puntaje personalizado</option>
                </HTMLSelect>
                <div v-if="item.points_type === 'equal'" class="Equal">
                    <HTMLInput
                        type="number"
                        id="points"
                        placeholder="Puntaje total a distribuir"
                        v-model:value="item.points"
                    />
                </div>
            </template>
        </section>
        <aside class="Item__destroy">
            <HTMLButtonIcon
                :click="() => buildForm.deleteItem(number)"
                classItem="fa-solid fa-xmark"
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
</style>
