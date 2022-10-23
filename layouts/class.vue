<script setup lang="ts">
// Types
import type { ClassroomModule } from '~~/models/classroom/modules.model'
import type { Panel } from '~~/models/classroom/panel.model'
// Nuxtapp
const { $moduleService, $fetchModule } = useNuxtApp()
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
watch(() => route.query.section, (newValue) => {
    const newValueSection = newValue as string
    panel.section = newValueSection ? newValueSection : '0'
})

try {
    const dataFetch = await $moduleService.getModule(idModule)
    _module.value = dataFetch
} catch (err) {
    const _err = $fetchModule.handleError(err)
    throw createError({
        ..._err,
        fatal: true,
    })
}

function addSection(section: { _id: string, name: string }) {
    if (_module.value) _module.value.sub_sections.push(section)
}
</script>

<template>
    <main>
        <ClassHeader
            v-if="_module"
            :panel="panel"
            :_module="_module"
            @newSection="(s) => addSection(s)"
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
