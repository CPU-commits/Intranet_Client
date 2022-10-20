<script setup lang="ts">
// Types
import type { ClassroomModule } from '~~/models/classroom/modules.model'
import type { Panel } from '~~/models/classroom/panel.model';
import { UserTypesKeys } from '~~/models/user/user.model';
// Props
const props = defineProps<{
    _module: ClassroomModule
    panel: Panel
}>()

const panel = toRef(props, 'panel')
// Nuxtapp
const { $moduleService } = useNuxtApp()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const path = route.path
// Emits
const emits = defineEmits<{
    (e: 'newSection', section: {
        name: string
        _id: string
    }): void
}>()
// Form
const subSection = ref('')
// Modal
const modal = ref(false)

// Section
async function addSection() {
    const insertedId = await $moduleService.addSection(
        subSection.value,
        props._module._id,
    )
    if (insertedId)
        emits('newSection', {
            name: subSection.value,
            _id: insertedId,
        })
}
</script>

<template>
    <header class="Header">
        <nav>
            <NuxtLink
                :class="!path.includes('trabajos') &&
                    !path.includes('calificaciones') &&
                    !path.includes('buscar') ? 'Selected' : ''"
                :to="`/aula_virtual/clase/${_module._id}`"
            >
                Panel
            </NuxtLink>
            <NuxtLink
                :class="path.includes('trabajos') ? 'Selected' : ''"
                :to="`/aula_virtual/clase/${_module._id}/trabajos`"
            >
                Trabajos
            </NuxtLink>
            <NuxtLink
                :class="path.includes('calificaciones') ? 'Selected' : ''"
                :to="`/aula_virtual/clase/${_module._id}/calificaciones`"
            >
                Calificaciones
            </NuxtLink>
            <NuxtLink
                :to="`/aula_virtual/clase/${_module._id}/buscar`"
                :class="path.includes('buscar') ? 'Selected' : ''"
            >
            <i class="fa-solid fa-magnifying-glass" />
            </NuxtLink>
        </nav>
        <section class="Header__subject">
            <h2>
                {{ _module.subject.subject }}
                <span v-if="auth.userTypeIs(UserTypesKeys.TEACHER)">
                    - {{ _module.section.course.course }}
                    {{ _module.section.section }}
                </span>
            </h2>
            <section
                v-if="panel.isPanel"
                class="Header__subject--sub_sections"
            >
                <NuxtLink
                    v-if="_module.sub_sections"
                    v-for="(subSection, i) in _module.sub_sections"
                    :key="i"
                    :to="`/aula_virtual/clase/${_module._id}?section=${i}`"
                    class="SubSection"
                    :class="i === parseInt(panel.section) ? 'ButtonSelected' : ''"
                >
                    {{ subSection.name }}
                </NuxtLink>
                <span v-if="!_module.sub_sections || _module.sub_sections.length === 0">
                    Sin sub-secciones...
                </span>
            </section>
            <div
                v-if="panel.isPanel && auth.userTypeIs(UserTypesKeys.TEACHER)"
                class="Header__subject--button"
            >
                <HTMLButtonIcon
                    title="Añadir sub-sección"
                    color="white"
                    hover="white"
                    :click="() => modal = true"
                    classItem="fa-solid fa-plus"
                />
            </div>
        </section>

        <!-- Modals -->
        <Modal v-model:opened="modal">
            <template #title>
                <h2>Añadir sub sección</h2>
            </template>
            <HTMLForm :form="addSection">
                <label for="sub-section">Sub sección</label>
                <HTMLInput v-model:value="subSection" id="sub-section" />
                <HTMLButton type="submit">Añadir</HTMLButton>
            </HTMLForm>
        </Modal>
    </header>
</template>

<style lang="scss" scoped>
	nav {
		padding: 13px;
		display: flex;
		justify-content: space-evenly;
		background-color: white;
		position: relative;
		border-top: 2px solid var(--color-light);
	}

	a {
		text-decoration: none;
		font-family: 'Karla', sans-serif;
		transition: color 0.4s;
		i {
			transition: color 0.4s;
		}
	}

	a:hover {
		color: var(--color-main);
		text-decoration: underline;
		i {
			color: var(--color-main);
		}
	}

	.Selected {
		color: var(--color-main);
		text-decoration: underline;
		i {
			color: var(--color-main);
		}
	}

	.Header__subject {
		border-top: 2px solid var(--color-light);
		background-color: var(--color-main);
		padding: 10px;
		box-shadow: var(--box-shadow);
		position: relative;
		h2 {
			color: white;
			text-align: center;
			font-size: 1.2rem;
		}
	}

	span {
		color: white;
	}

	.Header__subject--sub_sections {
		margin-top: 10px;
		display: flex;
		gap: 20px;
		margin-right: 30px;
		overflow-x: auto;
		align-items: center;
	}

	.SubSection {
		color: white;
		background: transparent;
		border: none;
		padding: 5px 10px;
		border: 1px solid white;
		transition: all 0.4s ease;
		border-radius: 4px;
	}

	.SubSection:hover {
		background-color: white;
		color: var(--color-main);
	}

	.ButtonSelected {
		background-color: white;
		color: var(--color-main);
	}

	.Header__subject--button {
		position: absolute;
		right: 10px;
		bottom: 10px;
	}
</style>
