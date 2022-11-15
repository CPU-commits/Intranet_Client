<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import type { Course, Section } from '~~/models/course/course.model'
import type { Teacher } from '~~/models/user/teacher.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
    ? `Secciones - Admin - ${schoolName} - Intranet`
    : 'Secciones - Admin - Intranet'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.DIRECTOR,
        UserTypesKeys.DIRECTIVE,
    ],
})
// Nuxtapp
const {
    $teacherService,
    $courseService,
    $fetchModule,
} = useNuxtApp()
// Composable
const spinner = useSpinner()
// Route
const route = useRoute()

const courseId = route.params.course
if (typeof courseId !== 'string')
    throw createError({
        message: '[course] must be a string',
        statusCode: 400,
        fatal: true,
    })

// Modals
const modal = ref(false)
const modalSections = ref(false)
// Selected
const sectionSelected = ref<Section | null>(null)
// Forms
const section = ref('')
const files = ref<FileList | null>(null)
const filesInput = [] as Array<HTMLInputElement>

// Data
const teachers = ref<Array<Teacher> | null>(null)
const sections = ref<Array<Section> | null>(null)
const course = ref<Course | null>(null)
const nextCourse = ref<Course | null>(null)
const nextSections = ref<Array<Section> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await Promise.all([
            $teacherService.getTeachers(false, 0),
            $courseService.getSectionsCourse(courseId),
            $courseService.getCourse(courseId),
        ])

        filesInput.length = dataFetch[1].length
        // Asign
        teachers.value = dataFetch[0].users
        sections.value = dataFetch[1]
        course.value = dataFetch[2]
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
})
// Sections
const errorNS = ref<ErrorFetch | null>(null)
async function getSectionsNextLevel() {
    try {
        // Clean error
        errorNS.value = null
        // Datafetch
        const dataFetch = await $courseService.getSectionsNextLevel(
            typeof courseId === 'string' ? courseId : '',
        )

        nextCourse.value = dataFetch.course
        nextSections.value = dataFetch.sections
    }catch (err) {
        const _err = $fetchModule.handleError(err)
        errorNS.value = _err
    }
}

async function newSection() {
    const sectionData = await $courseService.newSection(
        section.value,
        files.value ?? null,
        typeof courseId === 'string' ? courseId : '',
    )
    if (sectionData !== undefined && sections.value) {
        // New values
        section.value = ''
        sections.value = [sectionData, ...sections.value]
    }
}

async function addTeacher(idTeacher: string, idSection: string, index: number) {
    const changedTeacher = await $courseService.addTeacher(idTeacher, idSection)
    if (changedTeacher && idTeacher !== '' && sections.value)
        sections.value[index].header_teacher = idTeacher
}

async function deleteSection(id: string) {
    const isSectionDeleted = await $courseService.deleteSection(id)
    if (isSectionDeleted && sections.value)
        // Delete
        sections.value = sections.value.filter((section) => {
            if (section._id !== id) return section
        })
}

async function changeFile(sectionId: string, index: number) {
    const changedFile = await $courseService.changeFile(
        sectionId,
        filesInput[index].files,
    )
    if (changedFile && sections.value)
        sections.value[index].file.url = changedFile
}

async function selectNextSection(sectionData: Section | null = null) {
    const isSelected = await $courseService.selectNextSection(
        sectionSelected.value?._id ?? '',
        sectionData ? sectionData._id : undefined,
    )
    if (isSelected && sections.value) {
        sections.value = sections.value.map((section) => {
            if (section._id === sectionSelected.value?._id) {
                if (sectionData)
                    return {
                        ...section,
                        next_section: sectionData,
                        is_next_section_variable: false,
                    }
                return {
                    ...section,
                    next_section: undefined,
                    is_next_section_variable: true,
                }
            }
            return section
        })
        modalSections.value = false
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
                        :click="() => modal = true"
                        title="Agregar curso"
                        classItem="fa-solid fa-plus"
                    />
                </Icons>
            </template>
            <h2>
                Secciones
                <span v-if="course">
                    {{ course.course }}
                    {{ course.isFinal ? '(Curso final)' : '' }}
                </span>
            </h2>
            <br />
            <!-- Data -->
            <HTMLTable v-if="sections" :header="['Sección', 'Imágen', 'Sección sub-siguiente', 'Profesor jefe', '']">
                <tr v-for="(section, i) in sections" :key="section._id">
                    <td>{{ section.section }}</td>
                    <td>
                        <input
                            @change="() => changeFile(section._id, i)"
                            :ref="(el) => {
                                if (el) filesInput[i] = el as HTMLInputElement
                            }"
                            type="file"
                            class="file"
                            accept=".jpg, .jpeg, .png"
                        />
                        <LazyNuxtImg
                            @click="filesInput[i].click()"
                            :src="section.file.url"
                            :alt="section.section"
                        />
                    </td>
                    <td>
                        <div v-if="!course?.isFinal" class="Next">
                            {{ section.is_next_section_variable
                                ? 'Variable'
                                : section?.next_section
                                ? `${section.next_section.section}`
                                : 'Sin asignar' }}
                            <div>
                                <HTMLButtonIcon
                                    :click="() => {
                                        sectionSelected = section
                                        getSectionsNextLevel()
                                        modalSections = true
                                    }"
                                    classItem="fa-solid fa-arrows-turn-to-dots"
                                />
                            </div>
                        </div>
                        <span v-else>No aplica</span>
                    </td>
                    <td>
                        <HTMLSelect
                            :change="() => addTeacher(section?.header_teacher as string ?? '', section._id, i)"
                            v-model:value="section.header_teacher"
                            id="teacher"
                        >
                            <option value="">Sin asignar</option>
                            <option v-for="teacher in teachers" :value="teacher._id" :key="teacher._id">
                                {{ teacher.user.name }} {{ teacher.user.first_lastname }}
                            </option>
                        </HTMLSelect>
                    </td>
                    <td>
                        <HTMLButtonIcon
                            title="Eliminar sección"
                            :click="() => {
                                deleteSection(section._id)
                            }"
                            classItem="fa-solid fa-minus"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="sections && sections.length === 0">No hay secciones</span>
            
            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </AdminPanel>

        <!-- Modals -->
        <Modal v-model:opened="modal">
            <template #title>
                <h2>Agregar secci&oacute;n</h2>
            </template>
            <HTMLForm :form="newSection">
                <label for="section">Nombre secci&oacute;n</label>
                <HTMLInput v-model:value="section" id="section" />
                <label for="file">Im&aacute;gen</label>
                <HTMLInputFiles
                    :filter="{
                        filter: true,
                        type: 'image',
                        message: 'Debe seleccionar una imagen',
                    }"
                    accept=".jpg, .jpeg, .png"
                    v-model:files="files"
                    id="file"
                />
                <HTMLButton type="submit">Agregar secci&oacute;n</HTMLButton>
            </HTMLForm>
        </Modal>

        <Modal v-model:opened="modalSections">
            <template #title>
                <h2>Secciones sub-siguientes</h2>
            </template>
            <section v-if="nextSections && nextCourse">
                <h3>Curso {{ nextCourse.course }} ({{ nextCourse.level }}°)</h3>
                <br />
                <HTMLTable :header="['Sección', 'Seleccionar como siguiente']">
                    <tr v-for="(section, i) in nextSections" :key="i">
                        <td>
                            {{ section.section }}
                        </td>
                        <td>
                            <HTMLButtonIcon
                                :selected="sectionSelected?.next_section?._id === section._id"
                                :click="() => selectNextSection(section)"
                                classItem="fa-solid fa-circle-check"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Variable</td>
                        <td>
                            <HTMLButtonIcon
                                :selected="sectionSelected?.is_next_section_variable"
                                :click="() => selectNextSection()"
                                classItem="fa-solid fa-circle-check"
                            />
                        </td>
                    </tr>
                </HTMLTable>
            </section>

            <SpinnerGet />
            <Error v-if="errorNS" :err="errorNS" />
        </Modal>
    </NuxtLayout>
</template>

<style scoped>
	img {
		width: 100px;
		height: 80px;
		object-fit: cover;
		border: 2px solid var(--color-light);
		cursor: pointer;
	}

	.file {
		display: none;
	}

	.Next {
		display: flex;
		gap: 15px;
		justify-content: center;
	}

    @media (max-width: 575.98px) {
        img {
            width: 90px;
            height: 60px;
        }
    }
</style>
