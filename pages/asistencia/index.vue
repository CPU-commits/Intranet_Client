<script lang="ts" setup>
// Types
import { ErrorFetch } from '~/common/fetchModule'
import { Section } from '~/models/course/course.model'
import { FetchGet } from '~/models/fetch/defaults.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Asistencia - ${schoolName} - Intranet`
	: 'Asistencia - Intranet'
// NuxtApp
const { $assistanceService, $fetchModule } = useNuxtApp()

// Data
const error = ref<ErrorFetch | null>(null)
const sections = ref<Array<Section & { exists_assistance: boolean }> | null>(
	null,
)

onMounted(() => getSections({ total: true }))

// Total
const total = ref(0)
provide('total', total)

async function getSections(params?: FetchGet) {
	try {
		const dataFetch = await $assistanceService.getSections(params)

		if (params?.total) total.value = dataFetch.total
		sections.value = dataFetch.sections
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
			:header="['Curso', 'Asistencia diaria', '']"
			:navigate="{
				activate: true,
				max: 20,
				async fn(page) {
					await getSections({
						skip: page * 20,
					})
				},
			}"
		>
			<tr v-for="section in sections" :key="section._id">
				<td>
					{{ section.course.course }}
					{{ section.section }}
				</td>
				<td>
					<HTMLAIcon
						class-item="fa-solid fa-list-check"
						:href="`/asistencia/${section._id}`"
					/>
				</td>
				<td>
					<i
						v-if="section.exists_assistance"
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

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped>
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

@media (max-width: 575.98px) {
	h2 {
		font-size: 1.2rem;
	}

	.Assistance {
		margin: 10px;
	}
}
</style>
