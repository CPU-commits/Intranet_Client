<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import type { GradeProgram } from '~~/models/classroom/grade.model'
import type { Work } from '~~/models/classroom/work.model'
import type { UserFile } from '~~/models/file/file.model'
import type { UserForm } from '~~/models/form/form.model'
import { UserTypesKeys } from '~~/models/user/user.model'

// Utils
import { dateIsBefore } from '~~/utils/dates'
import {
    formatDate,
    getOnlyTime,
    removeTime,
    secondsToHoursFormat,
} from '~~/utils/format'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.TEACHER,
    ],
})
// Nuxtapp
const {
    $fetchModule,
    $formService,
    $workService,
    $gradesService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()
// Router
const route = useRoute()
const router = useRouter()

const idModule = route.params.module
const idWork = route.params.work
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
        fatal: true,
	})
if (typeof idWork !== 'string')
	throw createError({
		message: '[work] must be a string',
		statusCode: 400,
        fatal: true,
	})

// Form
// Dates
const canEdit = ref(false)
const dates = reactive({
    start_date: '',
    start_hour: '',
    limit_date: '',
    limit_hour: '',
})
const timeAccess = ref('')
// Attached
const linksAttached = ref<Array<{
    title: string
    link: string
    _id_attached?: string
}>>([])
const filesAttached = ref<Array<UserFile & { _id_attached?: string }>>([])

// Data
const work = ref<Work | null>(null)
const gradePrograms = ref<Array<GradeProgram> | null>(null)
const forms = ref<Array<UserForm> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await Promise.all([
            $workService.getWork(idWork),
            $gradesService.getGradePrograms(idModule),
            $formService.getForms(),
        ])
        work.value = dataFetch[0].work
        gradePrograms.value = dataFetch[1]
        forms.value = dataFetch[2]
        // Set dates
        dates.start_date = removeTime(work.value.date_start)
        dates.start_hour = getOnlyTime(work.value.date_start)
        dates.limit_date = removeTime(work.value.date_limit)
        dates.limit_hour = getOnlyTime(work.value.date_limit)
        timeAccess.value = secondsToHoursFormat(work.value.time_access)
        // Set attached
        work.value.attached?.forEach((attached) => {
            if (attached.type === 'file')
                filesAttached.value.push({
                    ...attached.file,
                    _id_attached: attached._id,
                })
            if (attached.type === 'link')
                linksAttached.value.push({
                    title: attached.title,
                    link: attached.link,
                    _id_attached: attached._id,
                })
        })
        // Set grade
        if (work.value.grade.is_acumulative) {
            work.value.grade._id = work.value.acumulative as string
        }
        // Can edit     
        canEdit.value = dateIsBefore(new Date(), new Date(work.value.date_start))
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
})

async function updateWork() {
    if (!work.value) return
    const updated = await $workService.updateWork(
        work.value,
        dates,
        timeAccess.value,
        filesAttached.value,
        linksAttached.value,
    )
    if (updated) router.push('../../trabajos')
}

function addItem() {
    work.value?.pattern.push({
        title: '',
        description: '',
        points: 0,
    })
}

async function deleteItem(index: number) {
    if (!work.value) return
    const idItem = work.value.pattern[index]._id
    if (idItem) {
        const deleted = await $workService.deleteItem(
            idWork as string,
            idItem,
        )
        if (deleted) work.value.pattern.splice(index, 1)
    }
}

async function deleteFile(index: number) {
    const idAttached = filesAttached.value[index]._id_attached
    const deleted = await $workService.deleteFile(
        idAttached as string,
        idWork as string,
    )
    if (deleted) filesAttached.value.splice(index, 1)
}

async function deleteLink(index: number) {
    const idAttached = linksAttached.value[index]._id_attached
    const deleted = await $workService.deleteLink(
        idAttached as string,
        idWork as string,
    )
    if (deleted) linksAttached.value.splice(index, 1)
}
</script>

<template>
    <NuxtLayout name="class">
        <section v-if="work" class="NewWork">
            <HTMLForm :form="updateWork">
                <label for="title">Titulo trabajo</label>
                <HTMLInput v-model:value="work.title" id="title" />
                <label for="">Descripci&oacute;n del trabajo (Opcional)</label>
                <HTMLTextArea v-model:value="work.description" />
                <template v-if="work.is_qualified && gradePrograms">
                    <label for="grade">Calificaci&oacute;n asignada</label>
                    <HTMLSelect id="grade" v-model:value="work.grade._id">
                        <option value="">Seleccione una opci&oacute;n</option>
                        <template v-for="gradeProgram in gradePrograms" :key="gradeProgram._id">
                            <option
                                v-if="!gradeProgram.is_acumulative"
                                :value="gradeProgram._id"
                            >
                                {{ gradeProgram.number }}°
                                ({{ gradeProgram.percentage }}%)
                            </option>
                            <option
                                v-else
                                v-for="acumulative in gradeProgram.acumulative"
                                :key="acumulative._id"
                                :value="acumulative._id"
                            >
                                {{ gradeProgram.number }}
                                [{{ acumulative.number }}°
                                ({{ acumulative.percentage }}%)]°
                                ({{ gradeProgram.percentage }}%)
                            </option>
                        </template>
                    </HTMLSelect>
                </template>
                <template v-if="canEdit">
                    <template v-if="work.type === 'form'">
                        <label for="form">
                            <i class="fa-solid fa-clipboard" />
                            Formulario asignado
                        </label>
                        <HTMLSelect v-model:value="work.form" id="form">
                            <option value="">Seleccione una opci&oacute;n</option>
                            <option
                                v-for="form in forms"
                                :value="form._id"
                                :key="form._id"
                            >
                                {{ form.title }}
                                {{ form.has_points ? '(Con puntaje)' : '(Sin puntaje)' }}
                                {{ formatDate(form.upload_date) }}
                            </option>
                        </HTMLSelect>
                    </template>
                    <template v-else-if="work.type === 'files'">
                        <h3>
                            <i class="fa-solid fa-scroll" />
                            Pauta entrega de archivo(s) *Eliminaci&oacute;n
                            sincr&oacute;nica
                        </h3>
                        <HTMLTable :header="['Titulo', 'Desc.', 'Puntaje', '']">
                            <tr v-for="(item, i) in work.pattern" :key="i">
                                <td><HTMLInput v-model:value="item.title" /></td>
                                <td><TextArea v-model:value="item.description" /></td>
                                <td><HTMLInput v-model:value="item.points" type="number" /></td>
                                <td>
                                    <HTMLButtonIcon
                                        title="Eliminar item"
                                        :click="() => deleteItem(i)"
                                        classItem="fa-solid fa-circle-minus"
                                    />
                                </td>
                            </tr>
                        </HTMLTable>
                        <HTMLButtonIcon
                            :click="addItem"
                            title="Añadir nuevo item a la pauta"
                            classItem="fa-solid fa-plus"
                        />
                    </template>
                </template>
                <!-- Time -->
                <h3><i class="fa-solid fa-hourglass" /> Tiempo</h3>
                <template v-if="canEdit">
                    <!-- Start -->
                    <label for="">Fecha inicio acceso al trabajo</label>
                    <HTMLInput id="limit" type="date" v-model:value="dates.start_date" />
                    <label for="">Hora inicio acceso al trabajo</label>
                    <HTMLInput id="limit" type="time" v-model:value="dates.start_hour" />
                </template>
                <!-- Limit -->
                <label for="limit">Fecha l&iacute;mite acceso al trabajo</label>
                <HTMLInput id="limit" type="date" v-model:value="dates.limit_date" />
                <label for="">Hora l&iacute;mite acceso al trabajo</label>
                <HTMLInput id="limit" type="time" v-model:value="dates.limit_hour" />
                <!-- /Time -->
                <template v-if="canEdit">
                    <template v-if="work.type === 'form'">
                        <label for="access">Tipo de acceso al formulario</label>
                        <HTMLSelect v-model:value="work.form_access" id="access">
                            <option value="default">Hasta fecha y hora l&iacute;mite</option>
                            <option value="wtime">Con tiempo l&iacute;mite</option>
                        </HTMLSelect>
                    </template>
                    <template v-if="work.type === 'form' && work.form_access === 'wtime'">
                        <label for="time_access">Tiempo de acceso al formulario (Horas:Minutos)</label>
                        <HTMLInput type="time" id="time_access" v-model:value="timeAccess" />
                    </template>
                </template>
                <h3>
                    <i class="fa-solid fa-paperclip" />
                    Adjuntos (Opcional)
                    *Eliminaci&oacute;n sincr&oacute;nica
                </h3>
                <section class="Attached">
                    <CloudFile
                        v-for="(file, i) in filesAttached"
                        :key="file._id.$oid"
                        :idModule="idModule"
                        :edit="true"
                        :isClassroom="true"
                        :file="file"
                        @delete="() => deleteFile(i)"
                    />
                    <ClassLink
                        v-for="(link, i) in linksAttached"
                        :key="i"
                        :deleteMe="() => deleteLink(i)"
                        :edit="true"
                        :link="link"
                    />
                </section>
                <ClassAttached
                    @new-file="(f) => filesAttached = f"
                    @new-link="(l) => linksAttached.push(l)"
                />
                <HTMLButton type="submit">Editar trabajo</HTMLButton>
            </HTMLForm>

            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </section>
    </NuxtLayout>
</template>

<style scoped>
	.NewWork {
		background-color: white;
		margin: 20px;
		padding: 15px;
		border-radius: 10px;
		box-shadow: var(--box-shadow);
		margin-bottom: 80vh;
	}

	.Attached {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
</style>
