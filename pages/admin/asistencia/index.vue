<script setup lang="ts">
// Types
import type { Ref } from 'vue'
import { Section } from '~/models/course/course.model'
import { FetchGet } from '~/models/fetch/defaults.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Asistencia - Admin - ${schoolName} - Intranet`
	: 'Asistencia - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTIVE, UserTypesKeys.DIRECTOR],
})
// Nuxt App
const { $fetchModule, $assistanceService } = useNuxtApp()

// Data
const error: Ref<ErrorFetch | null> = ref(null)
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
	<NuxtLayout name="admin">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<AdminPanel :nav="false">
			<h2>Asistencia</h2>

			<HTMLTable
				:header="['Curso', 'Asistencias por día']"
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
							:href="`/admin/asistencia/${section._id}`"
						/>
					</td>
				</tr>
			</HTMLTable>
			<span v-if="sections && sections.length === 0">
				No hay asistencias todav&iacute;a...
			</span>

			<!-- Error -->
			<Error v-if="error" :err="error" />
			<!-- Loading -->
			<SpinnerGet />
		</AdminPanel>
	</NuxtLayout>
</template>

<style scoped>
h1 {
	font-size: 1.4rem;
}
</style>
