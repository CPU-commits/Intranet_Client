<script setup lang="ts">
// Types
import type { Ref } from 'vue'
import type { ClassroomModule } from "~~/models/classroom/modules.model"
import type { Semester } from "~~/models/semester/semester.model"
import type { Student } from "~~/models/user/student.model"
import type { StudentGrade } from '~~/models/classroom/student_grade.model'
import type { GradeProgram } from '~~/models/classroom/grade.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Router
const route = useRoute()

const year = route.params.year
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
    ? `Archivado (${year}) - Admin - ${schoolName} - Intranet`
    : `Archivado (${year}) - Admin - Intranet`
// Guard
/*definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTIVE,
        UserTypesKeys.DIRECTOR,
    ],
})*/
// Nuxtapp
const {
    $fetchModule,
    $semesterService,
    $moduleService,
    $filesService,
    $gradesService,
} = useNuxtApp()
// Stores
const toasts = useToastsStore()

// SSR
const semesters: Ref<Array<{
    modules?: Array<ClassroomModule>
    semester: Semester
    students?: {
        students?: Array<Student>
    }
}> | null> = ref(null)
if (typeof year === 'string' && !isNaN(Number(year))) {
    try {
        semesters.value = (await $semesterService.getSemesterYear(parseInt(year))).semesters
    } catch (err){
        const _err = $fetchModule.handleError(err)
        throw createError({
            ..._err,
            fatal: true,
        })
    }
} else {
    throw createError({
        statusCode: 400,
        message: 'Param [year] is not a year',
        statusMessage: 'Param [year] is not a year',
        fatal: true,
    })
}
// Modals
const modal = ref(false)

// Functions
const semesterTitle = (semester: Semester) => {
    const status = semester.status === 2 ? 'Sin finalizar' : ''
    return `${semester.year} - ${semester.semester}° ${status}`
}

// Get data
const moduleGrades: Ref<{
    grades: Array<StudentGrade>
    gradesProgram: Array<GradeProgram>
} | null> = ref(null)

async function getModuleGrades(idModule: string) {
    try {
        moduleGrades.value = await $moduleService.getModuleGrades(idModule)

        modal.value = true
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        toasts.addToast({
            message: _err.message,
            type: 'error',
        })
    }
}

async function exportGrades(idModule: string) {
    try {
        const url = await $gradesService.exportGrades(idModule)
        $filesService.downloadFileUrl(url, 'calificaciones.xlsx')
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
        </Head>
        <!-- Body -->
        <AdminPanel :nav="false">
            <h1><i class="fa-solid fa-folder-open" /> {{ year }} - Archivado</h1>

            <section v-for="(semester, i) in semesters" class="Folder" :key="i">
				<h3>{{ semesterTitle(semester.semester) }}</h3>
                <section v-if="semester.semester.status === 0">
                    <h4><i class="fa-solid fa-box" /> M&oacute;dulos - Aula Virtual</h4>
                    <br />
					<HTMLTable v-if="semester.modules" :header="['Módulo', 'Calificaciones', 'Exportar']">
                        <tr v-for="(_module, i) in semester.modules" :key="i">
                            <td>
                                {{ _module.section.course.course }}
                                {{ _module.section.section }} ° - {{ _module.subject.subject }}
                            </td>
                            <td class="Button">
                                <HTMLButton
                                    :click="() => getModuleGrades(_module._id)"
                                    type="button"
                                >
                                    <i class="fa-solid fa-highlighter" />
                                </HTMLButton>
                            </td>
                            <td class="Button">
                                <HTMLButton :click="() => exportGrades(_module._id)" type="button">
                                    <i class="fa-solid fa-file-export" />
                                </HTMLButton>
                            </td>
                        </tr>
					</HTMLTable>
                    <section v-if="semester.semester.semester === 2">
                        <h4><i class="fa-solid fa-repeat" /> Estudiantes repitentes</h4>
                        <HTMLTable v-if="semester?.students?.students" :header="['Nombre', 'RUT']">
							<tr v-for="(student, i) in semester.students.students" :key="i">
								<td>{{ student.name }} {{ student.first_lastname }}</td>
								<td>{{ student.rut }}</td>
							</tr>
						</HTMLTable>
                        <p v-if="semester?.students?.students?.length === 0">Ning&uacute;n estudiante repitente</p>
                        <br />
                        <small>
							Repitentes totales: {{ semester.students?.students?.length ?? 0 }}
						</small>
                    </section>
                </section>
			</section>
        </AdminPanel>

        <!-- Modals -->
        <Modal v-model:opened="modal">
            <template #title>
                <h2>Calificaciones</h2>
            </template>
            <ClassTableGrade :moduleGrades="moduleGrades" />
        </Modal>
    </NuxtLayout>
</template>

<style scoped>
	.Folder {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 10px;
		margin-top: 10px;
		border: 1px solid var(--color-light);
	}

	.Button i {
		color: white;
	}
</style>
