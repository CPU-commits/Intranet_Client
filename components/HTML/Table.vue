<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
// Types
type Navigate = {
	activate: boolean
	fn?: (n: number) => any
	max?: number
}
defineProps<{
	header: Array<string>
	navigate?: Navigate
}>()

// Memo
defineEmits<{
	(e: 'memo', value: any): void
}>()
</script>

<template>
	<div>
		<section class="Table">
			<table>
				<thead class="Thead">
					<tr>
						<slot name="header" />
						<!-- eslint-disable vue/no-v-html -->
						<td
							v-for="(tdElement, i) in header"
							:key="i"
							v-html="tdElement"
						/>
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
			:navigate="navigate"
			@memo="(value: any) => $emit('memo', value)"
		/>
	</div>
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

@media (max-width: 575.98px) {
	tr td {
		font-size: 0.9rem;
		padding-bottom: 5px;
	}
}
</style>
