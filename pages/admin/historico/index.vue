<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule';
import type { History, HistoryTypeChange } from '~~/models/history/history.model'
import type { Semester } from '~~/models/semester/semester.model'
import type { User } from '~~/models/user/user.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import { formatDate } from '~~/utils/format';
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
    $historyService,
    $semesterService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()

// Modals
const modal = ref(false)
async function getSemesters() {
    try {
        modal.value = true
        const dataFetch = await Promise.all([
            $semesterService.getSemesters(),
            $historyService.getPersons(),
        ])

        semesters.value = dataFetch[0]
        persons.value = dataFetch[1]
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        errorSem.value = _err
    }
}
// Data
const history = ref<Array<History> | null>(null)
const semesters = ref<Array<Semester> | null>(null)
const persons = ref<Array<User> | null>(null)

const error = ref<ErrorFetch | null>(null)
const errorSem = ref<ErrorFetch | null>(null)
// Provide total for nav
const total = ref(0)
provide('total', total)
onMounted(() => getHistory(true))

async function getHistory(getTotal = false, limit = 30, skip = 0, extraQueryParams?: string) {
    try {
        const dataFetch = await $historyService.getHistory(
            true,
            limit,
            skip,
            extraQueryParams,
        )

        history.value = dataFetch.history
        if (getTotal) total.value = dataFetch.total
    } catch(err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
}

// Form
const filters = reactive({
    semester: '',
    type_change: '',
    person: '',
    date_type: '',
    specific_date: '',
    interval_date: {
        start_date: '',
        finish_date: '',
    },
})

function getTypeOfChange(type_change: keyof typeof HistoryTypeChange) {
    if (type_change === 'add') return 'Añadir'
    if (type_change === 'close') return 'Cerrar'
    if (type_change === 'delete') return 'Eliminar'
    if (type_change === 'dismiss') return 'Destituir'
    if (type_change === 'reintegrate') return 'Reintegrar'
    if (type_change === 'update') return 'Actualizar'
}

function applyFilters(getFilters = false) {
    let filtersQuery = ''
    if (filters.semester !== '') filtersQuery += `&semester=${filters.semester}`
    if (filters.type_change !== '') filtersQuery += `&change=${filters.type_change}`
    if (filters.person !== '') filtersQuery += `&person=${filters.person}`
    if (filters.date_type === 'specific')
        filtersQuery += `&specific_date=${filters.specific_date}`
    if (filters.date_type === 'interval')
        filtersQuery += `&date_start=${filters.interval_date.start_date}&date_finish=${filters.interval_date.finish_date}`
    if (getFilters) return filtersQuery
    getHistory(true, undefined, undefined, filtersQuery)
}
</script>

<template>
    <NuxtLayout name="admin">
        <AdminPanel>
            <template #nav>
                <Icons slot="nav">
                    <HTMLButtonIcon
                        :click="getSemesters"
                        classItem="fa-solid fa-filter"
                        title="Filtros"
                    />
                </Icons>
            </template>
            <h2>Cambios historicos</h2>
            <!-- Data -->
            <HTMLTable
                v-if="history"
                :header="['Cambio', 'Persona', 'Tipo de cambio', 'Justificación', 'Fecha']"
                :navigate="{
                    activate: true,
                    max: 30,
                    fn (n) {
                        const filters = applyFilters(true)
                        getHistory(false, 30, 30 * n, filters)
                    },
                }"
            >
                <tr v-for="his in history" :key="his._id">
                    <td>{{ his.change }}</td>
                    <td>{{ his.who.name }} {{ his.who.first_lastname }}</td>
                    <td>{{ getTypeOfChange(his.type_change) }}</td>
                    <td>{{ his.why ?? 'No aplica' }}</td>
                    <td>{{ formatDate(his.date) }}</td>
                </tr>
            </HTMLTable>

            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </AdminPanel>

        <Modal v-model:opened="modal">
            <template #title>
                <h2>Filtros</h2>
            </template>
            <HTMLForm v-if="semesters && persons" :form="() => applyFilters()">
                <h3>Semestre</h3>
                <!-- Data -->
                <HTMLSelect v-model:value="filters.semester" id="semester">
                    <option value="">Cualquier semestre</option>
                    <option v-for="semester in semesters" :value="semester._id" :key="semester._id">
                        {{ semester.year }} {{ semester.semester }}°
                    </option>
                </HTMLSelect>
                <h3>Tipo de cambio</h3>
                <HTMLSelect v-model:value="filters.type_change" id="type_change">
                    <option value="">Cualquier tipo de cambio</option>
                    <option value="add">Añadir</option>
                    <option value="delete">Eliminar</option>
                    <option value="update">Actualizar</option>
                    <option value="dismiss">Destituir</option>
                    <option value="reintegrate">Reintegrar</option>
                    <option value="close">Cerrar</option>
                </HTMLSelect>
                <h3>Persona</h3>
                <HTMLSelect v-model:value="filters.person" id="person">
                    <option value="">Cualquier persona</option>
                    <option v-for="person in persons" :value="person._id" :key="person._id">
                        {{ person.name }}
                        {{ person.first_lastname }}
                        {{ person.second_lastname }}
                    </option>
                </HTMLSelect>
                <h3>Fecha</h3>
                <HTMLSelect v-model:value="filters.date_type" id="date_type">
                    <option value="">Cualquier fecha</option>
                    <option value="specific">Fecha especifica</option>
                    <option value="interval">Intervalo de fechas</option>
                </HTMLSelect>
                <HTMLInput
                    v-if="filters.date_type === 'specific'"
                    v-model:value="filters.specific_date"
                    type="date"
                />
                <div v-if="filters.date_type === 'interval'">
                    <h4>Fecha inicio</h4>
                    <HTMLInput v-model:value="filters.interval_date.start_date" type="date" />
                    <h4>Fecha final</h4>
                    <HTMLInput v-model:value="filters.interval_date.finish_date" type="date" />
                </div>
                <HTMLButton type="submit">Aplicar filtros</HTMLButton>
            </HTMLForm>

            <SpinnerGet />
            <Error v-if="errorSem" :err="errorSem" />
        </Modal>
    </NuxtLayout>
</template>