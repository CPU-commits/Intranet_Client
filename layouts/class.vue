<script setup lang="ts">
// Types
import type { ClassroomModule } from '~~/models/classroom/modules.model'
import type { Panel } from '~~/models/classroom/panel.model'
import { UserTypesKeys } from '~~/models/user/user.model'
type Section = {
	_id: string
	name: string
}
// Nuxtapp
const { $moduleService, $fetchModule } = useNuxtApp()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const path = route.path
const idModule = route.params.module
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
		fatal: true,
	})

// Data
const _module = ref<ClassroomModule | null>(null)
const panel = reactive({
	isPanel:
		!path.includes('trabajos') &&
		!path.includes('calificaciones') &&
		!path.includes('buscar'),
	section: route.query.section ? route.query.section : 0,
}) as Panel
// Watch section
watch(
	() => route.query.section,
	(newValue) => {
		const newValueSection = newValue as string
		panel.section = newValueSection ?? '0'
	},
)

onMounted(async () => {
	try {
		const dataFetch = await $moduleService.getModule(idModule)
		_module.value = dataFetch

		const moduleName = `${_module.value.subject.subject} ${
			auth.userTypeIs(UserTypesKeys.TEACHER)
				? `- ${_module.value.section.course.course} ${_module.value.section.section}`
				: ''
		}`
		// Set title
		useHead({
			title: `${moduleName} ${document.title}`,
		})
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		throw createError({
			..._err,
			fatal: true,
		})
	}
})

function addSection(section: Section) {
	if (_module.value) _module.value.sub_sections.push(section)
}
</script>

<template>
	<main>
		<!-- eslint-disable vue/v-on-event-hyphenation -->
		<ClassHeader
			v-if="_module"
			:panel="panel"
			:_module="_module"
			@newSection="(s: Section) => addSection(s)"
		/>
		<slot />
	</main>
</template>

<style>
main {
	width: 100%;
	box-sizing: border-box;
}
</style>
