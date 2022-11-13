<script setup lang="ts">
// Types
import type { Specialty } from '~~/models/subject/specialty.model'
import type { Subject } from '~~/models/subject/subject.model'
import type { Course } from '~~/models/course/course.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model';
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
    $fetchModule,
    $courseService,
    $subjectService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()

// Modal
const modalSpecialty = ref(false)
const modalSubject = ref(false)
const modalAnchor = ref(false)
const modalCourseSubjects = ref(false)
const toggleCourseSubjects = (id: string, index: number) => {
    subjectAnchor.value = ''
    courseId.value = id
    coursePosition.value = index
    modalCourseSubjects.value = !modalCourseSubjects.value
    if (courses.value) courseEdit.value = courses.value[index]
    
    modalAnchor.value = false
}

// Form
const specialty = ref('')
const subject: { subject: string, specialty: string, _id?: string } = reactive({
    subject: '',
    specialty: '',
})
const subjectAnchor = ref('')
// Anchor
const courseId = ref('')
const courseEdit = ref<Course | null>(null)
const coursePosition = ref(0)
//Data
const subjects = ref<Array<Subject> | null>(null)
const specialties = ref<Array<Specialty> | null>(null)
const courses = ref<Array<Course> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await Promise.all([
            $subjectService.getSubjects(),
            $subjectService.getSpecialties(),
            $courseService.getCourses(),
        ])
        // Assign
        subjects.value = dataFetch[0]
        specialties.value = dataFetch[1]
        courses.value = dataFetch[2]
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
})

// Specialties
async function newSpecialty() {
    const dataFetch = await $subjectService.newSpecialty(specialty.value)
    if (dataFetch !== undefined && specialties.value) {
        // Form
        specialty.value = ''
        specialties.value = [dataFetch, ...specialties.value]
    }
}

async function deleteSpecialty(id: string) {
    const dataFetch = await $subjectService.deleteSpecialty(id)
    if (dataFetch && specialties.value)
        specialties.value = specialties.value.filter((specialty) => {
            if (specialty._id !== id) return specialty
        })
}
// Subjects
async function newSubject() {
    const dataFetch = await $subjectService.newSubject(subject)
    if (dataFetch !== undefined && subjects.value && specialties.value) {
        const specialty = specialties.value.findIndex((specialty) =>
            specialty._id === subject.specialty)
        // Form
        subject.subject = ''
        subject.specialty = ''
        // Data
        dataFetch.specialty = specialties.value[specialty]
        subjects.value = [dataFetch, ...subjects.value]

        modalSubject.value = false
    }
}

async function deleteSubject(id: string) {
    const dataFetch = await $subjectService.deleteSubject(id)
    if (dataFetch && subjects.value) {
        subjects.value = subjects.value.filter((subject) => {
            if (subject._id !== id) return subject
        })
    }
}
// Anchor
async function addSubject() {
    const cPosition = coursePosition.value
    const dataFetch = await $subjectService.addSubject(
        subjectAnchor.value,
        courseId.value,
    )
    if (dataFetch && courses.value) {
        // Add subject
        courses.value[cPosition].subjects.push(dataFetch)
        courseEdit.value = courses.value[cPosition]
    }
}

async function deleteSubjectCourse(idSubject: string) {
    const cPosition = coursePosition.value
    console.log(idSubject)
    const dataFetch = await $subjectService.deleteSubjectCourse(
        idSubject,
        courseId.value,
    )
    if (dataFetch && courses.value) {
        courses.value[cPosition].subjects = courses.value[cPosition].subjects.filter((subject) => {
            if ((subject as Subject)._id !== idSubject) return subject
        })
    }
}
</script>

<template>
    <NuxtLayout name="admin">
        <AdminPanel>
            <template #nav>
                <Icons slot="nav">
                    <HTMLButtonIcon
                        :click="() => modalSubject = true"
                        title="Agregar materia"
                        classItem="fa-solid fa-plus"
                    />
                    <HTMLButtonIcon
                        :click="() => modalSpecialty = true"
                        title="Especialidades"
                        classItem="fa-solid fa-puzzle-piece"
                    />
                    <HTMLButtonIcon
                        :click="() => modalAnchor = true"
                        title="Anclajes"
                        classItem="fa-solid fa-anchor"
                    />
                </Icons>
            </template>
            <h2>Materias</h2>
            <br />
            <!-- Data -->
            <HTMLTable v-if="subjects" :header="['Materia', 'Especialidad', '']">
                <tr v-for="(subject, i) in subjects" :key="i">
                    <td>{{ subject.subject }}</td>
                    <td>{{ subject.specialty ? subject.specialty.specialty : 'Sin asignar' }}</td>
                    <td>
                        <HTMLButtonIcon
                            :click="() => deleteSubject(subject._id)"
                            type="button"
                            classItem="fa-solid fa-minus"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="subjects && subjects.length === 0">No hay materias...</span>

            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </AdminPanel>

        <!-- Modals -->
        <Modal v-model:opened="modalSpecialty">
            <template #title>
                <h2>Especialidades</h2>
            </template>
            <HTMLForm :form="newSpecialty">
                <label for="specialty">Especialidad</label>
                <HTMLInput id="specialty" v-model:value="specialty" />
                <HTMLButton type="submit">Agregar especialidad</HTMLButton>
            </HTMLForm>
            <br />
            <HTMLTable v-if="specialties" :header="['Especialidad', '']">
                <tr v-for="(specialty, i) in specialties" :key="i">
                    <td>{{ specialty.specialty }}</td>
                    <td>
                        <HTMLButtonIcon
                            title="Eliminar especialidad"
                            :click="() => deleteSpecialty(specialty._id)"
                            classItem="fa-solid fa-minus"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="specialties && specialties.length === 0">No hay datos...</span>
        </Modal>

        <Modal v-model:opened="modalSubject">
            <template #title>
                <h2>Agregar materia</h2>
            </template>
            <HTMLForm :form="newSubject">
                <label for="subject">Materia</label>
                <HTMLInput v-model:value="subject.subject" id="subject" />
                <label for="specialty">Especialidad</label>
                <HTMLSelect id="specialty" v-model:value="subject.specialty">
                    <option value="">Sin especialidad</option>
                    <option v-for="(specialty, i) in specialties" :value="specialty._id" :key="i">
                        {{ specialty.specialty }}
                    </option>
                </HTMLSelect>
                <HTMLButton type="submit">Agregar materia</HTMLButton>
            </HTMLForm>
        </Modal>

        <Modal v-model:opened="modalAnchor">
            <template #title>
                <h2>
                    Anclaje Materias - Cursos ( <i class="fa-solid fa-book-bookmark" /> -
                    <i class="fa-solid fa-layer-group" /> )
                </h2>
            </template>
            <HTMLTable :header="['Curso', 'Materias']">
                <tr v-for="(course, i) in courses" :key="i">
                    <td>{{ course.course }}</td>
                    <td>
                        <HTMLButtonIcon
                            :click="() => toggleCourseSubjects(course._id, i)"
                            type="button"
                            classItem="fa-solid fa-book-bookmark"
                        />
                    </td>
                </tr>
            </HTMLTable>
        </Modal>

        <Modal v-model:opened="modalCourseSubjects" :fn="() => modalAnchor = true">
            <template #title>
                <h2 v-if="courses">
                    Materias {{ courses[coursePosition].course }}
                </h2>
            </template>
            <HTMLForm v-if="courseEdit" :form="addSubject">
                <label for="subject-a">Materia</label>
                <HTMLSelect v-model:value="subjectAnchor" id="subject-a">
                    <option value="">Selecione una materia</option>
                    <option
                        v-for="(subject, i) in subjects"
                        v-if="!courseEdit.subjects.some((s) => s._id === subject._id)"
                        :value="subject._id"
                        :key="i"
                    >
                        {{ subject.subject }}
                    </option>
                </HTMLSelect>
                <HTMLButton v-if="courses" type="submit">
                    Agregar anclaje a {{ courses[coursePosition].course }}
                </HTMLButton>
            </HTMLForm>
            <br />
            <HTMLTable v-if="courseEdit" :header="['Materia', '']">
                <tr v-for="(subject, i) in courseEdit.subjects" :key="i">
                    <td>{{ subject.subject }}</td>
                    <td>
                        <HTMLButtonIcon
                            :click="() => deleteSubjectCourse(
                                subject._id,
                            )"
                            classItem="fa-solid fa-minus"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="courseEdit && courseEdit.subjects.length === 0">No hay datos...</span>
        </Modal>
    </NuxtLayout>
</template>

<style scoped>
	h2 i {
		color: var(--color-main);
		font-size: 20px;
	}

	i {
		color: white;
	}

    @media (max-width: 575.98px) {
        h2 i {
            font-size: 1rem;
        }
    }
</style>
