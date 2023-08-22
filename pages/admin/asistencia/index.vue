<script setup lang="ts">
// Types
import type { Ref } from 'vue'
import { Section } from '~/models/course/course.model'
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
const { $fetchModule, $courseService } = useNuxtApp()

// Data
const error: Ref<ErrorFetch | null> = ref(null)
const sections = ref<Array<Section> | null>(null)

onMounted(() => getSections())

async function getSections() {
	try {
		const dataFetch = await $courseService.getSections()

		sections.value = dataFetch
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

			<HTMLTable :header="['Curso', 'Asistencias']">
				<tr v-for="(section, i) in sections" :key="i">
					<td>
						{{ section.course.course }}
						{{ section.section }}
					</td>
					<td>
						<HTMLAIcon
							class-item="fa-solid fa-eye"
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
