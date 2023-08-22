<script setup lang="ts">
// Types
import {
	Record,
	RecordPresentKeys,
	RecordReasonsKeys,
	RecordStatusKeys,
	RecordTypes,
	RecordTypesKeys,
} from '~~/models/assistance/record'
import { User, UserTypesKeys } from '~~/models/user/user.model'
import { ErrorFetch } from '~~/common/fetchModule'
import { Parent } from '~/models/user/parent.model'
import { Student } from '~/models/user/student.model'
import { RegisteredCalendarBlock } from '~/models/calendar/calendar.model'
import { CalendarBlock } from '~/models/calendar/block.model'
import { FetchGet } from '~/models/fetch/defaults.model'
import { PresenceStatus } from '~/models/assistance/student'

definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.DIRECTIVE,
		UserTypesKeys.DIRECTOR,
		UserTypesKeys.TEACHER,
	],
})
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Registros de entrada y salida - ${schoolName} - Intranet`
	: 'Registros de entrada y salida - Intranet'
// NuxtApp
const {
	$assistanceService,
	$fetchModule,
	$parentService,
	$studentsService,
	$calendarService,
	$filesService,
} = useNuxtApp()
// Stores
const authStore = useAuthStore()
// Route
const route = useRoute()

const idStudent = route.params.student as string
// Modal
const modalAdd = ref(false)
const modalDetails = ref(false)
// Form
const newRecord = reactive({
	record: '',
	type: '',
	status: '',
	present: RecordPresentKeys.IN_SCHOOL,
	otp: '',
	comments: '',
	reason: '',
	otp_parent: '',
	parent: '',
	block: '',
})
const files = ref<FileList | null>(null)
// Data
const student = ref<Student | null>(null)
const status = ref<{
	status: keyof typeof PresenceStatus
	org: keyof typeof RecordTypes
} | null>(null)
const records = ref<Array<Record> | null>(null)
const parents = ref<Array<Parent> | null>(null)
const block = ref<
	(Omit<RegisteredCalendarBlock, 'block'> & { block: CalendarBlock }) | null
>(null)
const recordSelected = ref<
	(Omit<Record, 'comment'> & { comment: string }) | null
>(null)

// Total
const total = ref(0)
provide('total', total)
// Error
const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const promises: [
			Promise<void>,
			Promise<Array<Parent>>,
			Promise<Student>,
			Promise<{
				status: keyof typeof PresenceStatus
				org: keyof typeof RecordTypes
			}>,
			Promise<
				Omit<RegisteredCalendarBlock, 'block'> & {
					block: CalendarBlock
				}
			>?,
		] = [
			getRecords({ total: true }),
			$parentService.getParentsByStudentID(idStudent),
			$studentsService.getStudent(idStudent),
			$studentsService.getStudentPresenceStatus(idStudent),
		]
		if (authStore.userTypeIs(UserTypesKeys.TEACHER))
			promises.push($calendarService.getProgressBlock())

		const dataFetch = await Promise.all(promises).then((data) => ({
			parents: data[1],
			student: data[2],
			status: data[3],
			block: data[4],
		}))

		parents.value = dataFetch.parents
		student.value = dataFetch.student
		status.value = dataFetch.status
		if (dataFetch.block) {
			block.value = dataFetch.block
			newRecord.block = dataFetch.block.block._id
		}
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

async function getRecords(params?: FetchGet) {
	const recordsData = await $assistanceService.getStudentRecords(
		idStudent,
		params,
	)
	records.value = recordsData.records
	if (recordsData.total) total.value = recordsData.total
}

// Functions
async function uploadNewRecord() {
	const record = await $assistanceService.uploadRecord(newRecord, idStudent)
	if (record) {
		records.value?.unshift({
			...record,
			auditor: {
				...authStore.getUser?.user,
			} as User,
		})

		newRecord.comments = ''
		newRecord.otp = ''
		newRecord.otp_parent = ''
		newRecord.parent = ''
		newRecord.present = RecordPresentKeys.IN_SCHOOL
		newRecord.reason = ''
		newRecord.record = ''
		newRecord.status = ''
		newRecord.type = ''

		modalAdd.value = false
	}
}

async function updateRecord() {
	const toUpdate = {
		comment:
			recordSelected.value?.comment !== ''
				? recordSelected.value?.comment
				: undefined,
		reason: recordSelected.value?.reason,
		file: files.value?.item(0),
	}
	const success = await $assistanceService.updateRecord(
		recordSelected.value?._id ?? '',
		toUpdate,
	)
	if (success) {
		const finded = records.value?.find(
			(record) => record._id === recordSelected.value?._id,
		)
		if (finded) {
			if (toUpdate.comment) finded.comment = toUpdate.comment
			if (toUpdate.reason) finded.reason = toUpdate.reason
		}
	}
}
// Formats
function formatType(type: string) {
	if (type === RecordTypesKeys.CLASS) return 'Clase/Sección'
	else if (type === RecordTypesKeys.DAILY) return 'Asistencia diaria'
	else if (type === RecordTypesKeys.ESTABLISHMENT) return 'Establecimiento'
	else if (type === RecordTypesKeys.EXTRACURRICULAR) return 'Extracurricular'
	else if (type === RecordTypesKeys.PROGRAM) return 'Programa'
}

function formatStatus(status: string) {
	if (status === RecordStatusKeys.AUTHORIZED_RE_ENTRY)
		return 'Re ingreso autorizado'
	else if (status === RecordStatusKeys.EARLY_DEPARTURE)
		return 'Salida anticipada'
	else if (status === RecordStatusKeys.EXCUSED_ABSENCE)
		return 'Ausencia con excusa'
	else if (status === RecordStatusKeys.TARDY) return 'Entrada tarde'
	else if (status === RecordStatusKeys.UNEXCUSED_ABSENCE)
		return 'Ausencia sin excusa'
}

function formatPresent(present: string) {
	if (present === RecordPresentKeys.DISCIPLINARY)
		return 'Acción disciplinaria'
	else if (present === RecordPresentKeys.IN_SCHOOL) return 'En escuela'
	else if (present === RecordPresentKeys.NONTRADITIONAL)
		return 'No tradicional'
	else if (present === RecordPresentKeys.OUT_SCHOOL_EXTRACURRICULAR)
		return 'Fuera del colegio extracurricular'
	else if (present === RecordPresentKeys.OUT_SCHOOL_PROGRAM)
		return 'Fuera del colegio programa'
}

function formatAbsent(absent: string) {
	if (absent === RecordReasonsKeys.DISCIPLINARY) return 'Acción disciplinaria'
	else if (absent === RecordReasonsKeys.EMPLOYMENT) return 'Empleo/Trabajo'
	else if (absent === RecordReasonsKeys.FAMILY) return 'Actividad familiar'
	else if (absent === RecordReasonsKeys.FAMILY_EMERGENCY)
		return 'Emergencia familiar'
	else if (absent === RecordReasonsKeys.HEALTH) return 'Problema de salud'
	else if (absent === RecordReasonsKeys.LEGAL) return 'Problema legal'
	else if (absent === RecordReasonsKeys.NONINSTRUCIONAL)
		return 'Actividad no institucional - reconocida por la entidad'
	else if (absent === RecordReasonsKeys.RELIGIOUS) return 'Religión'
	else if (absent === RecordReasonsKeys.SKIPPING)
		return 'Fuga/Escape del colegio'
	else if (absent === RecordReasonsKeys.TRANSPORTATION)
		return 'Problema de transporte'
	else if (absent === RecordReasonsKeys.UNKNOWN) return 'Desconocido'
}
</script>

<template>
	<section class="Register">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<h2>Registros de entrada y salida</h2>
		<h3>
			{{ student?.name }}
			{{ student?.first_lastname }}
			({{ student?.rut }})
		</h3>
		<!-- Student Status -->
		<h3>
			<template v-if="status?.status === 'out'">
				<i class="fa-solid fa-house-chimney"></i>
				Fuera del colegio
			</template>
			<template v-else-if="status?.status === 'absent'">
				<i
					class="fa-solid fa-person-walking-dashed-line-arrow-right"
				></i>
				Ausente
			</template>
			<template
				v-else-if="
					status?.status === 'retired' &&
					status.org === 'class/section'
				"
			>
				<i class="fa-solid fa-person-breastfeeding"></i>
				Retirado de clases
			</template>
			<template v-else-if="status?.status === 'retired'">
				<i class="fa-solid fa-person-breastfeeding"></i>
				Retirado del establecimiento
			</template>
			<template v-else-if="status?.status === 'present'">
				<i class="fa-solid fa-user-check"></i>
				Presente
			</template>
			<template v-else-if="status?.status === 'unknown'">
				<i class="fa-solid fa-question"></i>
				Desconocido
			</template>
		</h3>
		<!-- Buttons -->
		<Icons v-if="status?.status !== 'out'" class="Items">
			<HTMLButtonIcon
				class-item="fa-solid fa-plus"
				:click="() => (modalAdd = true)"
			/>
		</Icons>

		<HTMLTable
			:header="['Tipo', 'Estado', 'Auditor', 'Fecha', 'Detalles']"
			:navigate="{
				activate: true,
				max: 20,
				fn(page: number) {
					getRecords({ skip: page * 20 })
				},
			}"
		>
			<tr v-for="record in records" :key="record._id">
				<td>{{ formatType(record.type) }}</td>
				<td>
					{{ formatStatus(record.status) }}
					<span
						v-if="
							record.status ===
								RecordStatusKeys.EARLY_DEPARTURE &&
							!record.parent?.is_signed &&
							!record.parent?.signature_file
						"
					>
						(Adjuntar firma apoderado)
					</span>
				</td>
				<td>
					{{ record.auditor.name }}
					{{ record.auditor.first_lastname }}
					({{ formatUserType(record.auditor.user_type) }})
				</td>
				<td>{{ formatDate(record.date) }}</td>
				<td>
					<HTMLButtonIcon
						class-item="fa-solid fa-ellipsis"
						:click="
							() => {
								modalDetails = true
								recordSelected = Object.assign(
									{},
									{
										...record,
										comment: record?.comment
											? record.comment
											: '',
									},
								)
							}
						"
					/>
				</td>
			</tr>
		</HTMLTable>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
		<!-- Modals -->
		<Modal v-model:opened="modalDetails">
			<template #title>
				<h2>Detalles registro</h2>
			</template>
			<HTMLForm v-if="recordSelected" :form="updateRecord">
				<!-- Excuse -->
				<template v-if="authStore.getID === recordSelected.auditor._id">
					<label
						v-if="
							recordSelected.status === 'unexcused_absence' ||
							recordSelected.status === 'excused_absence'
						"
						for="excuse"
					>
						Excusa
					</label>
					<HTMLSelect
						v-if="
							recordSelected.status === 'unexcused_absence' ||
							recordSelected.status === 'excused_absence'
						"
						id="excuse"
						v-model:value="recordSelected.reason"
					>
						<option :value="RecordReasonsKeys.UNKNOWN">
							{{ formatAbsent(RecordReasonsKeys.UNKNOWN) }}
						</option>
						<option :value="RecordReasonsKeys.DISCIPLINARY">
							{{ formatAbsent(RecordReasonsKeys.DISCIPLINARY) }}
						</option>
						<option :value="RecordReasonsKeys.EMPLOYMENT">
							{{ formatAbsent(RecordReasonsKeys.EMPLOYMENT) }}
						</option>
						<option :value="RecordReasonsKeys.FAMILY">
							{{ formatAbsent(RecordReasonsKeys.FAMILY) }}
						</option>
						<option :value="RecordReasonsKeys.FAMILY_EMERGENCY">
							{{
								formatAbsent(RecordReasonsKeys.FAMILY_EMERGENCY)
							}}
						</option>
						<option :value="RecordReasonsKeys.HEALTH">
							{{ formatAbsent(RecordReasonsKeys.HEALTH) }}
						</option>
						<option :value="RecordReasonsKeys.LEGAL">
							{{ formatAbsent(RecordReasonsKeys.LEGAL) }}
						</option>
						<option :value="RecordReasonsKeys.NONINSTRUCIONAL">
							{{
								formatAbsent(RecordReasonsKeys.NONINSTRUCIONAL)
							}}
						</option>
						<option :value="RecordReasonsKeys.RELIGIOUS">
							{{ formatAbsent(RecordReasonsKeys.RELIGIOUS) }}
						</option>
						<option :value="RecordReasonsKeys.SKIPPING">
							{{ formatAbsent(RecordReasonsKeys.SKIPPING) }}
						</option>
						<option :value="RecordReasonsKeys.TRANSPORTATION">
							{{ formatAbsent(RecordReasonsKeys.TRANSPORTATION) }}
						</option>
					</HTMLSelect>
				</template>
				<template v-else-if="recordSelected.reason">
					<fieldset>
						<legend>Excusa</legend>
						<span>{{ formatAbsent(recordSelected.reason) }}</span>
					</fieldset>
				</template>
				<!-- Present -->
				<h3 v-if="recordSelected.present">
					Presencialidad:
					<span>{{ formatPresent(recordSelected.present) }}</span>
				</h3>
				<!-- Parent -->
				<template v-if="recordSelected.parent">
					<h3>
						<i class="fa-solid fa-person-breastfeeding"></i>
						Apoderado
					</h3>
					<fieldset>
						<legend>Persona que retir&oacute;</legend>
						<span>
							{{ recordSelected.parent.user.name }}
							{{ recordSelected.parent.user.first_lastname }}
							({{ recordSelected.parent.user.rut }})
						</span>
					</fieldset>
					<fieldset>
						<legend>Firma</legend>
						<span v-if="recordSelected.parent.is_signed">
							Firma v&iacute;a OTP
						</span>
						<div v-else>
							<HTMLInputFiles
								v-if="
									authStore.userTypeNotIs(
										UserTypesKeys.TEACHER,
									)
								"
								v-model:files="files"
								accept="application/pdf"
								:filter="{
									filter: true,
									type: 'pdf',
									message: 'Solo PDF',
								}"
							/>
							<footer>
								<small
									v-if="!recordSelected.parent.signature_file"
								>
									Adjunte en PDF la firma del apoderado...
								</small>
								<small v-else class="line">
									<HTMLButtonIcon
										class-item="fa-solid fa-file-pdf"
										:click="
											() =>
												$filesService.downloadFile(
													recordSelected?.parent
														?.signature_file._id
														? getFileID(
																recordSelected
																	.parent
																	.signature_file
																	._id,
														  )
														: '',
													true,
												)
										"
										:one-hundred="false"
									/>
									Descargar archivo firma
								</small>
							</footer>
						</div>
					</fieldset>
				</template>

				<template v-if="authStore.getID === recordSelected.auditor._id">
					<label for="comment">Comentarios</label>
					<HTMLTextArea
						id="comment"
						v-model:value="recordSelected.comment"
					/>
					<HTMLButton type="submit"> Actualizar registro </HTMLButton>
				</template>
				<template v-else>
					<fieldset>
						<legend>Comentarios</legend>
						<span v-if="recordSelected.comment !== ''">{{
							recordSelected.comment
						}}</span>
						<span v-else>Sin comentarios</span>
					</fieldset>
				</template>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalAdd">
			<template #title>
				<h2>Añadir nuevo registro</h2>
			</template>
			<HTMLForm :form="uploadNewRecord">
				<label for="type">Tipo de registro</label>
				<HTMLSelect id="type" v-model:value="newRecord.record">
					<option value="">Seleccione un tipo de registro</option>
					<option v-if="status?.status === 'absent'" value="absent">
						Ingreso de estudiante atrasado
					</option>
					<option v-if="status?.status === 'present'" value="early">
						Retiro anticipado del estudiante
					</option>
					<option
						v-if="
							authStore.userTypeNotIs(UserTypesKeys.TEACHER) &&
							status?.status === 'retired'
						"
						value="reingress"
					>
						Reingreso del estudiante
					</option>
				</HTMLSelect>
				<template v-if="newRecord.record !== ''">
					<label v-if="newRecord.record === 'absent'" for="event"
						>Tipo</label
					>
					<HTMLSelect
						v-if="newRecord.record === 'absent'"
						id="event"
						v-model:value="newRecord.type"
					>
						<option value="">
							Seleccione un tipo de asistencia
						</option>
						<option
							v-if="authStore.userTypeIs(UserTypesKeys.TEACHER)"
							:value="RecordTypesKeys.CLASS"
						>
							{{ formatType(RecordTypesKeys.CLASS) }}
						</option>
						<option :value="RecordTypesKeys.ESTABLISHMENT">
							{{ formatType(RecordTypesKeys.ESTABLISHMENT) }}
						</option>
						<option :value="RecordTypesKeys.EXTRACURRICULAR">
							{{ formatType(RecordTypesKeys.EXTRACURRICULAR) }}
						</option>
						<option :value="RecordTypesKeys.PROGRAM">
							{{ formatType(RecordTypesKeys.PROGRAM) }}
						</option>
					</HTMLSelect>
					<small
						v-if="
							authStore.userTypeIs(UserTypesKeys.TEACHER) &&
							newRecord.record === 'absent' &&
							newRecord.type === RecordTypesKeys.CLASS
						"
					>
						<i v-if="block">
							Clase actual de {{ block?.subject?.subject }}
							{{ block?.block.hour_start }} -
							{{ block?.block.hour_finish }} ({{
								block?.block.number
							}})
						</i>
						<i v-else>Ninguna clase actual</i>
					</small>
					<label v-if="newRecord.record === 'absent'" for="status"
						>Estado</label
					>
					<HTMLSelect
						v-if="newRecord.record === 'absent'"
						id="status"
						v-model:value="newRecord.status"
					>
						<option value="">Seleccione un estado</option>
						<option :value="RecordStatusKeys.TARDY">
							{{ formatStatus(RecordStatusKeys.TARDY) }}
						</option>
						<option :value="RecordStatusKeys.AUTHORIZED_RE_ENTRY">
							{{
								formatStatus(
									RecordStatusKeys.AUTHORIZED_RE_ENTRY,
								)
							}}
						</option>
					</HTMLSelect>
					<label v-if="newRecord.record === 'absent'" for="present">
						Presencialidad
					</label>
					<HTMLSelect
						v-if="newRecord.record === 'absent'"
						id="present"
						v-model:value="newRecord.present"
					>
						<option value="">Seleccione una presencialidad</option>
						<option :value="RecordPresentKeys.IN_SCHOOL">
							{{ formatPresent(RecordPresentKeys.IN_SCHOOL) }}
						</option>
						<option
							:value="
								RecordPresentKeys.OUT_SCHOOL_EXTRACURRICULAR
							"
						>
							{{
								formatPresent(
									RecordPresentKeys.OUT_SCHOOL_EXTRACURRICULAR,
								)
							}}
						</option>
						<option :value="RecordPresentKeys.OUT_SCHOOL_PROGRAM">
							{{
								formatPresent(
									RecordPresentKeys.OUT_SCHOOL_PROGRAM,
								)
							}}
						</option>
					</HTMLSelect>
					<label v-if="newRecord.record === 'early'" for="reason">
						Motivo
					</label>
					<HTMLSelect
						v-if="newRecord.record === 'early'"
						id="reason"
						v-model:value="newRecord.reason"
					>
						<option value="">Seleccione un motivo</option>
						<option :value="RecordReasonsKeys.EMPLOYMENT">
							{{ formatAbsent(RecordReasonsKeys.EMPLOYMENT) }}
						</option>
						<option :value="RecordReasonsKeys.FAMILY">
							{{ formatAbsent(RecordReasonsKeys.FAMILY) }}
						</option>
						<option :value="RecordReasonsKeys.FAMILY_EMERGENCY">
							{{
								formatAbsent(RecordReasonsKeys.FAMILY_EMERGENCY)
							}}
						</option>
						<option :value="RecordReasonsKeys.HEALTH">
							{{ formatAbsent(RecordReasonsKeys.HEALTH) }}
						</option>
						<option :value="RecordReasonsKeys.LEGAL">
							{{ formatAbsent(RecordReasonsKeys.LEGAL) }}
						</option>
						<option :value="RecordReasonsKeys.NONINSTRUCIONAL">
							{{
								formatAbsent(RecordReasonsKeys.NONINSTRUCIONAL)
							}}
						</option>
						<option :value="RecordReasonsKeys.RELIGIOUS">
							{{ formatAbsent(RecordReasonsKeys.RELIGIOUS) }}
						</option>
					</HTMLSelect>
					<label for="comments">Comentarios (Opcional)</label>
					<HTMLTextArea
						id="comments"
						v-model:value="newRecord.comments"
					/>
					<label for="otp">OTP</label>
					<HTMLInput id="otp" v-model:value="newRecord.otp" />
					<template
						v-if="
							newRecord.record === 'early' &&
							authStore.userTypeNotIs(UserTypesKeys.TEACHER)
						"
					>
						<h4>
							<i class="fa-solid fa-person-breastfeeding"></i>
							Apoderado
						</h4>
						<label for="parent">Persona que retira</label>
						<HTMLSelect
							id="parent"
							v-model:value="newRecord.parent"
						>
							<option value="">
								Seleccione persona que retira
							</option>
							<option
								v-for="parent in parents"
								:key="parent._id"
								:value="parent._id"
							>
								{{ parent.name }}
								{{ parent.first_lastname }}
								({{ parent.rut }})
							</option>
						</HTMLSelect>
						<label for="otp-parent">OTP (opcional)</label>
						<HTMLInput
							id="otp-parent"
							v-model:value="newRecord.otp_parent"
						/>
						<small v-if="newRecord.otp_parent === ''">
							<i>
								Si decide no usar el OTP del apoderado,
								despu&eacute;s tendr&aacute; que cargar su firma
								a trav&eacute;s de un PDF...
							</i>
						</small>
					</template>
				</template>
				<HTMLButton type="submit"> Añadir nuevo registro </HTMLButton>
			</HTMLForm>
		</Modal>
	</section>
</template>

<style scoped>
.dark-mode .Register {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Register {
	box-shadow: var(--box-shadow);
}

.Register {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.Items {
	box-sizing: border-box;
	padding: 10px;
	width: 100%;
	border: 2px solid var(--color-main);
}

.Register {
	width: 100%;
	margin: 20px;
	background-color: white;
	padding: 20px;
	border-radius: 15px;
}

h2 {
	margin-bottom: 15px;
}

.line {
	display: flex;
	padding: 5px;
	align-items: center;
}

@media (max-width: 575.98px) {
	h2 {
		font-size: 1.2rem;
	}

	.Register {
		margin: 10px;
	}
}
</style>
