<script setup lang="ts">
// Types
type Navigate = {
	activate: boolean
	fn?: (n: number) => any
	max?: number
}
const { header, navigate } = defineProps<{
    header: Array<string>
    navigate?: Navigate
}>()

// Memo
defineEmits<{
	(e: 'memo', value: any): void
}>()
</script>

<template>
    <section class="Table">
        <table>
            <thead class="Thead">
                <tr>
                    <td v-for="tdElement in header" v-html="tdElement" />
                </tr>
            </thead>
            <tbody class="Tbody">
                <slot />
            </tbody>
        </table>
    </section>
	<slot name="footer" />
    <HTMLNav
		v-if="navigate?.activate"
		@memo="(value) => $emit('memo', value)"
		:navigate="navigate"
	/>
</template>

<style scoped>
	.Table {
		overflow-x: auto;
		width: 100%;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	tr {
		text-align: center;
	}

	tr td {
		color: var(--color-main);
		font-weight: 700;
	}
</style>
