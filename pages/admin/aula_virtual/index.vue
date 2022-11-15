<script setup lang="ts">
// Types
import type { Ref } from 'vue';
import type { ErrorFetch } from '~~/common/fetchModule';
import type { GradeProgram } from '~~/models/classroom/grade.model';
import type { ClassroomModule } from '~~/models/classroom/modules.model';
import type { StudentGrade } from '~~/models/classroom/student_grade.model';
import type { DirectiveModule } from '~~/models/classroom/modules.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
    ? `Aula Virtual - Admin - ${schoolName} - Intranet`
    : 'Aula Virtual - Admin - Intranet'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTIVE,
        UserTypesKeys.DIRECTOR,
    ],
})
// Nuxtapp
const { $gradesService, $moduleService, $fetchModule } = useNuxtApp()
// Compostable
const spinner = useSpinner()
// Stores
const toasts = useToastsStore()

// Modals
const modalGrade = ref(false)
const modalGrades = ref(false)
const modalConfg = ref(false)
const modalDirectives = ref(false)
// Grades
let moduleSelected: ClassroomModule
// Directives
const directives: Omit<DirectiveModule, 'module'> = reactive({
    min_grades: {
        actived: false,
        min_grade: 0,
    },
    continuous: false,
    all_grades: false,
})
const directivesModules: Ref<Array<{
    module: string
    status: boolean
    messages: Array<string>
}>> = ref([])
// Fetch data
const modules: Ref<Array<ClassroomModule> | null> = ref(null)
const gradeConfig = {
    min: '',
    max: '',
}

const error: Ref<ErrorFetch | null> = ref(null)
onMounted(async () => {
    try {
        const dataFetch = await Promise.all([
            $gradesService.getGradeConfig(),
            $moduleService.getModules(),
        ])
        gradeConfig.max = dataFetch[0].max
        gradeConfig.min = dataFetch[0].min

        modules.value = dataFetch[1]
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
})

// Functions
const moduleGrades: Ref<{
    grades: Array<StudentGrade>
    gradesProgram: Array<GradeProgram>
} | null> = ref(null)

async function getModuleGrades(idModule: string) {
    try {
        moduleGrades.value = await $moduleService.getModuleGrades(idModule)
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        toasts.addToast({
            message: _err.message,
            type: 'error',
        })
    }
}

async function getDirectivesModule(idModule: string) {
    try {
        const dataFetch = await $moduleService.getDirectivesModule(idModule)

        // Assign
        directives.all_grades = dataFetch.all_grades
        directives.continuous = dataFetch.continuous
        directives.min_grades = dataFetch.min_grades

        modalConfg.value = !modalConfg.value
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        toasts.addToast({
            message: _err.message,
            type: 'error',
        })
    }
}

async function addDirective(idModule: string) {
    await $moduleService.addDirective(directives, idModule)
    modalConfg.value = false
}

async function getDirectives() {
    try {
        directivesModules.value = await $moduleService.getDirectivesStatus()
        modalDirectives.value = !modalDirectives.value
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        toasts.addToast({
            message: _err.message,
            type: 'error',
        })
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
        <AdminPanel>
            <template #nav>
                <Icons>
                    <HTMLButtonIcon
                        title="Calificaciones"
                        class-item="fa-solid fa-feather-pointed"
                        :click="() => modalGrade = !modalGrade"
                    />
                    <HTMLButtonIcon
                        title="Consultar directivas en módulos"
                        class-item="fa-solid fa-circle-nodes"
                        :click="getDirectives"
                    />
                </Icons>
            </template>
            <h1>Aula virtual</h1>
            <br />
            <!-- Data -->
            <HTMLTable :header="['Módulo', 'Estado', 'Calificaciones', 'Confg.']">
                <tr v-for="(_module, i) in modules" :key="i">
                    <td>
                        {{ _module.section.course.course }}
                        {{ _module.section.section }}° - {{ _module.subject.subject}}
                    </td>
                    <td>{{ !_module.status ? 'Activo' : 'Finalizado' }}</td>
                    <td>
                        <HTMLButtonIcon
                            type="button"
                            :click="() => {
                                modalGrades = !modalGrades

                                moduleSelected = _module
                                getModuleGrades(_module._id)
                            }"
                            class-item="fa-solid fa-highlighter"
                        />
                    </td>
                    <td>
                        <HTMLButtonIcon
                            type="button"
                            :click="() => {
                                moduleSelected = _module
                                getDirectivesModule(_module._id)
                            }"
                            class-item="fa-solid fa-gear"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="modules && modules.length === 0">
                No hay m&oacute;dulos para este semestre
            </span>

            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </AdminPanel>

        <!-- Modals -->
        <Modal v-model:opened="modalGrade">
            <template #title>
                <h2>Configuraci&oacute;n calificaciones</h2>
            </template>

            <HTMLForm :form="() => $gradesService.updateGrades(gradeConfig)">
                <label for="min">Calificaci&oacute;n m&iacute;nima</label>
                <HTMLInput id="min" v-model:value="gradeConfig.min" />
                <label for="max">Calificaci&oacute;n m&aacute;xima</label>
                <HTMLInput id="max" v-model:value="gradeConfig.max" />
                <HTMLButton type="submit">Actualizar configuraci&oacute;n</HTMLButton>
            </HTMLForm>
        </Modal>

        <Modal v-model:opened="modalGrades">
            <template #title>
                <h2 slot="title">
                    Calificaciones
                    {{ moduleSelected.section.course.course }}
                    {{ moduleSelected.section.section }} ° - {{ moduleSelected.subject.subject }}
                </h2>
            </template>
            <ClassTableGrade :module-grades="moduleGrades" />
        </Modal>

        <Modal v-model:opened="modalConfg">
            <template #title>
                <h2 slot="title">Configuraci&oacute;n de m&oacute;dulo</h2>
            </template>
            <HTMLForm :form="() => addDirective(moduleSelected._id)">
                <h3><i class="fa-solid fa-sign-hanging" /> Directivas</h3>
                <label for="min">Cantidad m&iacute;nima de calificaciones</label>
                <HTMLCheckbox v-model:checked="directives.min_grades.actived" id="min_actived" />
                <HTMLInput
                    v-if="directives.min_grades.actived"
                    v-model:value="directives.min_grades.min_grade"
                    type="number"
                    id="min"
                />
                <label for="continuous">Calificaciones programadas continuas entre s&iacute;</label>
                <HTMLCheckbox v-model:checked="directives.continuous" id="continuous" />
                <label for="all_grades">
                    Todos los alumnos con todas las calificaciones programadas
                </label>
                <HTMLCheckbox v-model:checked="directives.all_grades" id="all_grades" />
                <HTMLButton type="submit">Actualizar m&oacute;dulo</HTMLButton>
            </HTMLForm>
        </Modal>

        <Modal v-model:opened="modalDirectives">
            <template #title>
                <h2 slot="title">Directivas de m&oacute;dulos</h2>
            </template>
            <HTMLTable :header="['Módulo', 'Estado directivas', 'Directivas por completar']">
                <tr v-for="(directive, i) in directivesModules" :key="i">
                    <td>{{ directive.module }}</td>
                    <td>{{ directive.status ? 'Completo' : 'Incompleto' }}</td>
                    <td>{{ directive.status ? 'No aplica' : directive.messages.join(' | ') }}</td>
                </tr>
            </HTMLTable>
        </Modal>
    </NuxtLayout>
</template>

<style scoped>
	.fa-highlighter,
	.fa-gear {
		color: white;
	}

    h1 {
		font-size: 1.4rem;
	}

    h2 {
        text-align: center;
    }
</style>
