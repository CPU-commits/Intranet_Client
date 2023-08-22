<script lang="ts" setup>
// Types
import { ErrorFetch } from '~/common/fetchModule'
import { AssistanceBlock } from '~/models/assistance/blocks'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Asistencia - ${schoolName} - Intranet`
	: 'Asistencia - Intranet'
// NuxtApp
const { $assistanceService, $fetchModule } = useNuxtApp()

// Data
const error = ref<ErrorFetch | null>(null)
const blocks = ref<Array<AssistanceBlock> | null>(null)

onMounted(() => getBlocks())

// Total
const total = ref(0)
provide('total', total)

async function getBlocks() {
	try {
		const dataFetch = await $assistanceService.getBlocks()

		blocks.value = dataFetch
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
}
</script>

<template>
	<section class="Assistance">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<h2>Asistencia {{ formatDateLL(new Date()) }}</h2>
		<HTMLTable
			v-if="blocks && blocks.length > 0"
			:header="[
				'Curso',
				'Materia',
				'Bloque',
				'Asistencia diaria',
				'Sincronizada',
				'Firmado',
			]"
		>
			<tr v-for="(block, i) in blocks" :key="i">
				<td>
					{{ block.course }}
					{{ block.section.section }}
				</td>
				<td>{{ block.subject }}</td>
				<td>
					({{ block.block.number }}) {{ block.block.hour_start }} -
					{{ block.block.hour_finish }}
				</td>
				<td>
					<HTMLAIcon
						class-item="fa-solid fa-list-check"
						:href="`/asistencia/${block.section._id}/${block.block._id}`"
					/>
				</td>
				<td>
					<i
						v-if="block.exists_assistance"
						class="fa-solid fa-circle-check"
						title="Asistencia subida"
					/>
					<i
						v-else
						class="fa-solid fa-circle-xmark"
						title="Asistencia sin subir"
					/>
				</td>
				<td>
					<i
						v-if="block.exists_assistance && block.signed"
						class="fa-solid fa-circle-check"
						title="Asistencia subida"
					/>
					<i
						v-else
						class="fa-solid fa-circle-xmark"
						title="Asistencia sin subir"
					/>
				</td>
			</tr>
		</HTMLTable>
		<article v-else-if="blocks && blocks.length === 0" class="NoAssist">
			<NuxtImg src="/img/beach.svg" alt="Mujer en la playa" />
			<i>Parece que hoy no hay asistencia...</i>
		</article>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped lang="scss">
.dark-mode .Assistance {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Assistance {
	box-shadow: var(--box-shadow);
}

.Assistance {
	width: 100%;
	margin: 20px;
	background-color: white;
	padding: 20px;
	border-radius: 15px;
}

h2 {
	margin-bottom: 15px;
}

.NoAssist {
	display: flex;
	flex-direction: column;
	align-items: center;
	img {
		max-height: 400px;
	}
}

@media (max-width: 575.98px) {
	h2 {
		font-size: 1.2rem;
	}

	.Assistance {
		margin: 10px;
	}
}
</style>
