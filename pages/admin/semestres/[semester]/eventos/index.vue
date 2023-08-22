<script setup lang="ts">
// Types
import { Crisis } from 'models/calendar/crisis.model'
import { Event, EventType } from 'models/calendar/event.model'
import { Course, Section } from 'models/course/course.model'
import { FetchGet } from 'models/fetch/defaults.model'
import { formateDateInputUTC } from '@/utils/format'
import { ErrorFetch } from '~~/common/fetchModule'
import type { Semester } from '~~/models/semester/semester.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { Subject } from 'models/subject/subject.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Eventos de Semestre - Admin - ${schoolName} - Intranet`
	: 'Eventos de Semestre - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $semesterService, $fetchModule, $courseService, $calendarService } =
	useNuxtApp()
// Router
const route = useRoute()

const idSemester = route.params.semester as string
// Modal
const modalAdd = ref(false)
const modalCrisis = ref(false)
const modalCrisisSee = ref(false)
const modalEventSee = ref(false)
// Form
const newEvent = reactive({
	name: '',
	institution_type: '',
	parent_institution: '',
	institution: '',
	date: '',
	finish_date: '',
	type: '',
	description: '',
})
const newCrisis = reactive({
	name: '',
	start_date: '',
	type: '',
	description: '',
})

const course = computed(() => {
	return courses.value?.find(({ sections }) =>
		sections.find(({ _id }) => _id === newEvent.parent_institution),
	)
})
// Data
const events = ref<Array<Event> | null>(null)
const crisisData = ref<Array<Crisis> | null>(null)
const courses = ref<Array<Course> | null>(null)
const semester = ref<Semester | null>(null)

const _crisis = ref<Crisis | null>(null)
const _event = ref<Event | null>(null)
// Total
const totalCrisisName = 'total-crisis'
const totalEventsName = 'total-events'

const totalCrisis = ref(0)
const totalEvents = ref(0)
provide(totalCrisisName, totalCrisis)
provide(totalEventsName, totalEvents)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$semesterService.getSemester(idSemester),
			$courseService.getCourses(),
			getEvents({ total: true, limit: 10 }),
			getCrisis({ total: true, limit: 5 }),
		])

		semester.value = dataFetch[0]
		courses.value = dataFetch[1]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

async function getEvents(params?: FetchGet) {
	const dataFetch = await $calendarService.getEventsSemester(
		idSemester,
		params,
	)
	events.value = dataFetch.events

	if (dataFetch.total) totalEvents.value = dataFetch.total
}

function formatEventType(type: keyof typeof EventType) {
	if (type === 'emergency') return 'Emergencia'
	else if (type === 'instructional') return 'Instructivo'
	else if (type === 'holiday') return 'Feriado'
	else if (type === 'late_arrival_early_dismissal')
		return 'Llegada tarde - Salida temprana'
	else if (type === 'other') return 'Otro'
	else if (type === 'strike') return 'Huelga'
	else if (type === 'teacheronly') return 'Solo profesores'
	return ''
}

function formatEventIType(iType: string) {
	if (iType === 'section') return 'Sección'
	else if (iType === 'country') return 'Nivel país (Mineduc)'
	else if (iType === 'establishment') return 'Establecimiento'
	else if (iType === 'subject') return 'Sección - materia'
	return ''
}

function formatInstitution(event: Event) {
	if (!event.institution) return
	const inst = event.institution
	const isSubject = (inst: Subject | Section): inst is Subject =>
		'subject' in inst

	if (isSubject(inst)) {
		return `${event.parent_institution?.course.course} ${event.parent_institution?.section} - ${inst.subject}`
	} else {
		return `${inst.course.course} ${inst.section}`
	}
}

async function getCrisis(params?: FetchGet) {
	const dataFetch = await $calendarService.getCrisisSemester(
		idSemester,
		params,
	)
	crisisData.value = dataFetch.crisis.map((crisis) => ({
		...crisis,
		end_date: crisis.end_date
			? formateDateInputUTC(crisis.end_date)
			: undefined,
	}))

	if (dataFetch.total) totalCrisis.value = dataFetch.total
}

// Functions
async function uploadEvent() {
	const insertedEvent = await $calendarService.uploadEvent({
		...newEvent,
		semester: idSemester,
	})
	if (insertedEvent) {
		events.value?.push(insertedEvent)
		// Init form
		newEvent.date = ''
		newEvent.description = ''
		newEvent.institution = ''
		newEvent.institution_type = ''
		newEvent.name = ''
		newEvent.parent_institution = ''
		newEvent.type = ''

		modalAdd.value = false
	}
}

async function uploadCrisis() {
	const insertedId = await $calendarService.uploadCrisis({
		...newCrisis,
		semester: idSemester,
	})
	if (insertedId) {
		crisisData.value?.push({
			...newCrisis,
			_id: insertedId,
			code: '',
			semester: '',
		})
		// Init form
		newCrisis.description = ''
		newCrisis.name = ''
		newCrisis.start_date = ''
		newCrisis.type = ''

		modalCrisis.value = false
	}
}

async function updateCrisis() {
	const success = await $calendarService.updateCrisis(
		{
			finish_date: _crisis.value?.end_date ?? '',
		},
		_crisis.value?._id ?? '',
	)
	if (success && crisisData.value) {
		const index = crisisData.value.findIndex(
			({ _id }) => _id === _crisis.value?._id,
		)
		crisisData.value[index].end_date = _crisis.value?.end_date
	}
}

async function deleteCrisis(idCrisis: string) {
	const success = await $calendarService.deleteCrisis(idCrisis)
	if (success && crisisData.value) {
		crisisData.value.splice(
			crisisData.value.findIndex(({ _id }) => _id === idCrisis),
			1,
		)
		modalCrisisSee.value = false
	}
}

async function deleteEvent(idEvent: string) {
	const success = await $calendarService.deleteEvent(idEvent)
	if (success && events.value) {
		events.value.splice(
			events.value.findIndex(({ _id }) => _id === idEvent),
			1,
		)
		modalEventSee.value = false
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
		<AdminPanel :nav="semester?.status === 2">
			<template #nav>
				<Icons>
					<HTMLButtonIcon
						class-item="fa-solid fa-plus"
						:click="() => (modalAdd = true)"
						title="Agregar evento"
					>
						<i class="fa-regular fa-calendar-xmark" />
					</HTMLButtonIcon>
					<HTMLButtonIcon
						class-item="fa-solid fa-plus"
						:click="() => (modalCrisis = true)"
						title="Agregar crisis"
					>
						<i class="fa-solid fa-fire" />
					</HTMLButtonIcon>
				</Icons>
			</template>

			<h2>
				Eventos de Semestre {{ semester?.semester }}°
				{{ semester?.year }}
			</h2>
			<br />
			<!-- Data -->
			<h4>Crisis</h4>
			<br />
			<HTMLTable
				:header="['Nombre', 'Tipo', 'Fecha inicio', 'Más']"
				:navigate="{
					activate: true,
					fn: (n) => getEvents({ limit: 5, skip: n * 5 }),
					max: 5,
				}"
				:total-name="totalCrisisName"
			>
				<tr v-for="crisis in crisisData" :key="crisis._id">
					<td>{{ crisis.name }}</td>
					<td>{{ crisis.type }}</td>
					<td>{{ formatDateLLUTC(crisis.start_date) }}</td>
					<td>
						<HTMLButtonIcon
							class-item="fa-solid fa-ellipsis"
							:click="
								() => {
									modalCrisisSee = true
									_crisis = JSON.parse(JSON.stringify(crisis))
								}
							"
						/>
					</td>
				</tr>
			</HTMLTable>
			<br />
			<h4>Eventos</h4>
			<br />
			<HTMLTable
				:header="['Nombre', 'Tipo', 'Fecha', 'Más']"
				:navigate="{
					activate: true,
					fn: (n) => getEvents({ limit: 10, skip: n * 10 }),
					max: 10,
				}"
				:total-name="totalEventsName"
			>
				<tr v-for="event in events" :key="event._id">
					<td>{{ event.name }}</td>
					<td>{{ formatEventType(event.type) }}</td>
					<td>{{ formatDateLLUTC(event.date) }}</td>
					<td v-if="event.date !== event.finish_date">
						{{ formatDateLLUTC(event.date) }} -
						{{ formatDateLLUTC(event.finish_date) }}
					</td>
					<td>
						<HTMLButtonIcon
							class-item="fa-solid fa-ellipsis"
							:click="
								() => {
									modalEventSee = true
									_event = JSON.parse(JSON.stringify(event))
								}
							"
						/>
					</td>
				</tr>
			</HTMLTable>

			<span v-if="semester?.status === 0">
				Todav&iacute;a no se puede ver los eventos
			</span>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>
		<!-- Modals -->
		<Modal v-model:opened="modalAdd">
			<template #title>
				<h2>Agregar evento</h2>
			</template>
			<HTMLForm :form="uploadEvent">
				<label for="name">Nombre</label>
				<HTMLInput id="name" v-model:value="newEvent.name" />
				<label for="institution_type">Afectado</label>
				<HTMLSelect
					id="institution_type"
					v-model:value="newEvent.institution_type"
				>
					<option value="">Seleccione un afectado</option>
					<option value="country">Nivel pa&iacute;s (Mineduc)</option>
					<option value="establishment">Establecimiento</option>
					<option value="section">Secci&oacute;n</option>
					<option value="subject">Secci&oacute;n - materia</option>
				</HTMLSelect>
				<template
					v-if="
						newEvent.institution_type !== '' &&
						newEvent.institution_type !== 'country' &&
						newEvent.institution_type !== 'establishment'
					"
				>
					<label for="section">Secci&oacute;n</label>
					<HTMLSelect
						id="section"
						v-model:value="newEvent.parent_institution"
					>
						<option value="">Seleccione una secci&oacute;n</option>
						<!-- eslint-disable-next-line vue/no-v-for-template-key -->
						<template v-for="course in courses" :key="course._id">
							<option
								v-for="section in course.sections"
								:key="section._id"
								:value="section._id"
							>
								{{ course.course }}
								{{ section.section }}
							</option>
						</template>
					</HTMLSelect>
					<label
						v-if="newEvent.institution_type === 'subject' && course"
						for="subject"
					>
						Materia
					</label>
					<HTMLSelect
						v-if="newEvent.institution_type === 'subject' && course"
						id="subject"
						v-model:value="newEvent.institution"
					>
						<option value="">Seleccione una secci&oacute;n</option>
						<option
							v-for="subject in course.subjects"
							:key="subject._id"
							:value="subject._id"
						>
							{{ subject.subject }}
						</option>
					</HTMLSelect>
				</template>
				<label for="date">Fecha inicio</label>
				<HTMLInput
					id="date"
					v-model:value="newEvent.date"
					type="date"
				/>
				<label for="finish_date">Fecha final</label>
				<HTMLInput
					id="finish_date"
					v-model:value="newEvent.finish_date"
					type="date"
				/>
				<label for="type">Tipo de evento</label>
				<HTMLSelect id="type" v-model:value="newEvent.type">
					<option value="">Seleccione un tipo de evento</option>
					<option value="emergency">Emergencia</option>
					<option value="holiday">Feriado</option>
					<option value="instructional">Instructivo</option>
					<option value="strike">Huelga</option>
					<option value="late_arrival_early_dismissal">
						Llegada tarde - Salida temprana
					</option>
					<option value="teacheronly">Solo profesores</option>
					<option value="other">Otro</option>
				</HTMLSelect>
				<label for="description">Descripci&oacute;n</label>
				<HTMLTextArea
					id="description"
					v-model:value="newEvent.description"
				/>

				<HTMLButton type="submit">Subir evento</HTMLButton>
			</HTMLForm>
		</Modal>
		<Modal v-model:opened="modalCrisis">
			<template #title>
				<h2>Agregar crisis</h2>
			</template>
			<HTMLForm :form="uploadCrisis">
				<label for="name">Nombre</label>
				<HTMLInput id="name" v-model:value="newCrisis.name" />
				<label for="type">Tipo</label>
				<HTMLInput id="type" v-model:value="newCrisis.type" />
				<label for="start_date">Fecha de inicio</label>
				<HTMLInput
					id="start_date"
					v-model:value="newCrisis.start_date"
					type="date"
				/>
				<label for="description">Descripci&oacute;n</label>
				<HTMLTextArea
					id="description"
					v-model:value="newCrisis.description"
				/>

				<HTMLButton type="submit">Subir crisis</HTMLButton>
			</HTMLForm>
		</Modal>
		<Modal v-model:opened="modalCrisisSee">
			<template #title>
				<h2>Crisis {{ _crisis?.name }}</h2>
			</template>
			<HTMLForm v-if="_crisis" :form="updateCrisis">
				<h3>Fechas</h3>
				<fieldset>
					<legend>Fecha inicio</legend>
					<p>{{ formatDateLLUTC(_crisis.start_date) }}</p>
				</fieldset>
				<fieldset>
					<legend>Fecha final</legend>
					<HTMLInput v-model:value="_crisis.end_date" type="date" />
				</fieldset>

				<fieldset>
					<legend>Descripci&oacute;n</legend>
					<p>{{ _crisis.description }}</p>
				</fieldset>

				<HTMLButton type="submit">Actualizar</HTMLButton>
				<small>{{ _crisis.code }}</small>

				<aside class="Delete">
					<HTMLButtonIcon
						class-item="fa-solid fa-trash-can"
						hover="var(--color-danger)"
						title="Eliminar crisis"
						:click="() => deleteCrisis(_crisis?._id ?? '')"
					/>
				</aside>
			</HTMLForm>
		</Modal>
		<Modal v-model:opened="modalEventSee">
			<template #title>
				<h2>Evento {{ _event?.name }}</h2>
			</template>
			<div v-if="_event" class="Event">
				<fieldset>
					<legend>Afectado</legend>
					<p>{{ formatEventIType(_event.institution_type) }}</p>
				</fieldset>
				<!-- Institution -->
				<fieldset v-if="_event.institution">
					<legend>Descripci&oacute;n</legend>
					<p>{{ formatInstitution(_event) }}</p>
				</fieldset>

				<fieldset>
					<legend>Descripci&oacute;n</legend>
					<p>{{ _event.description }}</p>
				</fieldset>
				<aside class="Delete">
					<HTMLButtonIcon
						class-item="fa-solid fa-trash-can"
						hover="var(--color-danger)"
						title="Eliminar evento"
						:click="() => deleteEvent(_event?._id ?? '')"
					/>
				</aside>
			</div>
		</Modal>
	</NuxtLayout>
</template>

<style scoped>
td i {
	color: white;
}

span {
	width: 100%;
	text-align: center;
	font-style: italic;
	color: var(--color-main);
	font-weight: bold;
	font-size: 1.3rem;
}

.Event {
	display: flex;
	flex-direction: column;
	gap: 15px;
	padding-bottom: 10px;
}

.Delete {
	position: absolute;
	bottom: 15px;
	right: 15px;
}
</style>
