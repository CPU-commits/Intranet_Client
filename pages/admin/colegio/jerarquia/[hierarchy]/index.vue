<script setup lang="ts">
// Types
import { HierarchyData } from '~/models/college/hierarchy_data.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Colegio - Admin - ${schoolName} - Intranet`
	: 'Colegio - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR],
})
// Nuxtapp
const { $fetchModule, $collegeService } = useNuxtApp()
// Router
const route = useRoute()

const idHierarchy = route.params.hierarchy as string
// Modal
const modalNew = ref(false)
// Data
const hierarchy = ref<
	| (HierarchyData & {
			schedule_key: string
			modality_key: string
	  })
	| null
>(null)

const error = ref<ErrorFetch | null>(null)

onMounted(async () => {
	try {
		const dataFetch = await $collegeService.getRegisteredHierarchy(
			idHierarchy,
		)
		hierarchy.value = dataFetch
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

// Get grades
const grades = computed(() => {
	return hierarchy.value?.levels.flatMap(({ codes, branches }) => [
		...(codes ?? []),
		...(branches ?? []).flatMap(({ economics }) =>
			economics.flatMap(({ specialties }) =>
				specialties.flatMap(({ codes }) => codes),
			),
		),
	])
})

async function deleteGrade(grade: string) {
	const success = await $collegeService.deleteGrade(grade, idHierarchy)
	if (success && hierarchy.value)
		hierarchy.value.levels = hierarchy.value.levels.filter(
			({ codes, branches }) =>
				!codes?.includes(grade) &&
				!branches?.some(({ economics }) =>
					economics.some(({ specialties }) =>
						specialties.some(({ codes }) => codes.includes(grade)),
					),
				),
		)
}

async function addGrades(hierarchyData: HierarchyData) {
	const success = await $collegeService.addGrades(
		hierarchyData.levels,
		idHierarchy,
	)
	if (success && hierarchy.value)
		hierarchy.value.levels = [
			...hierarchy.value.levels,
			...hierarchyData.levels,
		]
}
</script>

<template>
	<NuxtLayout name="admin">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<AdminPanel :nav="false">
			<!-- Data -->
			<h2>Jerarqu&iacute;a</h2>
			<br />
			<article v-if="hierarchy" class="Hierarchy">
				<!-- Content -->
				<HTMLTable :header="['Código', 'Grado', 'Especialidad', '']">
					<tr
						v-for="(grade, i) in hierarchy.levels
							.filter(({ codes }) => codes)
							.flatMap(({ codes }) => codes)"
						:key="i"
					>
						<td>{{ grade?.split(':').at(0) }}</td>
						<td>{{ grade?.split(':').at(1) }}</td>
						<td>N/A</td>
						<td>
							<HTMLButtonIcon
								class-item="fa-solid fa-minus"
								:click="() => deleteGrade(grade as string)"
							/>
						</td>
					</tr>
					<!-- eslint-disable vue/no-v-for-template-key -->
					<template
						v-for="(specialty, i) in hierarchy.levels
							.filter(({ branches }) => branches)
							.flatMap(({ branches }) =>
								branches?.flatMap(({ economics }) =>
									economics.flatMap(
										({ specialties }) => specialties,
									),
								),
							)"
						:key="i"
					>
						<tr v-for="(grade, j) in specialty?.codes" :key="j">
							<td>{{ grade?.split(':').at(0) }}</td>
							<td>{{ grade?.split(':').at(1) }}</td>
							<td>{{ specialty?.value }}</td>
							<td>
								<HTMLButtonIcon
									class-item="fa-solid fa-minus"
									:click="() => deleteGrade(grade)"
								/>
							</td>
						</tr>
					</template>
				</HTMLTable>
				<HTMLButtonIcon
					title="Agregar grado(s)"
					class-item="fa-solid fa-plus"
					:click="() => (modalNew = true)"
				/>
				<h4>Modalidad: {{ hierarchy.modality }}</h4>
				<h4>Jornada: {{ hierarchy.schedule }}</h4>
			</article>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
			<!-- Modals -->
			<Modal v-model:opened="modalNew">
				<template #title>
					<h2>Nuevo(s) grados</h2>
				</template>
				<AdminHierarchy
					:action="addGrades"
					:start-step="2"
					:start-form="{
						modality: hierarchy?.modality_key,
						schedule: hierarchy?.schedule_key,
					}"
					:filter-grades="grades"
					button-text="Agregar grados"
				/>
			</Modal>
		</AdminPanel>
	</NuxtLayout>
</template>

<style scoped lang="scss">
.Hierarchy {
	display: flex;
	flex-direction: column;
	padding: 10px;
	gap: 10px;
	border-radius: 6px;
	border: 2px solid var(--color-light);
	margin: 10px 0;
	position: relative;
}

.Hierarchy aside {
	position: absolute;
	right: 5px;
	bottom: 5px;
	display: flex;
	gap: 10px;
}
</style>
