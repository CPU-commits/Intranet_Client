<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule';
import type { ClassroomModule } from '~~/models/classroom/modules.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
    ? `Aula Virtual - ${schoolName} - Intranet`
    : 'Aula Virtual - Intranet'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.STUDENT,
        UserTypesKeys.STUDENT_DIRECTIVE,
        UserTypesKeys.TEACHER,
    ],
})
// Nuxtapp
const {
    $moduleService,
    $fetchModule,
} = useNuxtApp()

// Data
const modules = ref<Array<ClassroomModule> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await $moduleService.getClassModules()
        modules.value = dataFetch
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
})
</script>

<template>
    <section class="Classroom">
        <!-- Head -->
        <Head>
            <Title>{{ title }}</Title>
        </Head>
        <!-- Body -->
        <ClassMenu />
        <section v-if="modules" class="Classroom__modules">
            <ClassModule v-for="(_module, i) in modules" :key="i" :moduleData="_module" />
        </section>
        <span v-if="modules && modules.length === 0">Sin m&oacute;dulos...</span>

        <SpinnerGet />
        <Error v-if="error" :err="error" />
    </section>
</template>

<style scoped>
	.Classroom {
		padding: 20px;
        width: 100%;
	}

	.Classroom__modules {
		padding: 20px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 220px);
		gap: 15px;
	}

    @media (max-width: 767.98px) {
        .Classroom {
            padding: 15px;
        }

        .Classroom__modules {
            justify-content: center;
        }
    }

    @media (max-width: 575.98px) {
        .Classroom {
            padding: 10px;
        }
    }
</style>
