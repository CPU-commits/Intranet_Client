<script setup lang="ts">
// Types
import { removeTimeUTC } from '@/utils/format'
import { CalendarBlock } from '~/models/calendar/block.model'
import { RegisteredCalendarBlock } from '~/models/calendar/calendar.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import type { GradeProgram } from '~~/models/classroom/grade.model'
import type { Work } from '~~/models/classroom/work.model'
import type { UserFile } from '~~/models/file/file.model'
import { UserTypesKeys } from '~~/models/user/user.model'

type Link = {
	title: string
	link: string
	_id_attached?: string
}
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(
	schoolName
		? `- Editar trabajo - ${schoolName} - Intranet`
		: `- Editar trabajo - Intranet`,
)
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.TEACHER],
})
// Stores
const toastsStore = useToastsStore()
// Nuxtapp
const {
	$fetchModule,
	$moduleService,
	$workService,
	$gradesService,
	$calendarService,
} = useNuxtApp()
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

// Modal
const modalDate = ref(false)
// Form
const newDate = ref('')
const selectedSession = ref<{
	block: string
	dates: Array<string>
} | null>(null)
const sessions = computed(() => {
	return (
		work.value?.sessions?.map((session) => ({
			dates: session.dates,
			block: blocks.value?.find(({ _id }) => _id === session.block),
		})) ?? []
	)
})
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
const linksAttached = ref<Array<Link>>([])
const filesAttached = ref<Array<UserFile & { _id_attached?: string }>>([])

// Data
const work = ref<Work | null>(null)
const gradePrograms = ref<Array<GradeProgram> | null>(null)
const blocks = ref<Array<
	Omit<RegisteredCalendarBlock, 'block'> & {
		block: CalendarBlock
	}
> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$workService.getWork(idWork),
			$gradesService.getGradePrograms(idModule),
			$moduleService.getModule(idModule),
		]).then(async (data) => ({
			work: data[0],
			programs: data[1],
			blocks: await $calendarService.getRegisteredsBlockBySubjectNSection(
				data[2].subject._id,
				data[2].section._id,
			),
		}))
		work.value = dataFetch.work.work
		gradePrograms.value = dataFetch.programs
		blocks.value = dataFetch.blocks
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
		// Set sessions
		if (work.value.sessions)
			work.value.sessions = work.value.sessions.map((session) => ({
				block: session.block,
				dates: session.dates.map((date) => removeTimeUTC(date)),
			}))
		// Set grade
		if (work.value.grade.is_acumulative) {
			work.value.grade._id = work.value.acumulative as string
		}
		// Can edit
		canEdit.value = dateIsBefore(
			new Date(),
			new Date(work.value.date_start),
		)
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

async function updateWork() {
	if (!work.value) return
	let firstDate: Date | null = null
	let lastDate: Date | null = null
	for (const session of work.value.sessions ?? []) {
		const block = blocks.value?.find(({ _id }) => _id === session.block)

		const dates = session.dates.flatMap((date) => [
			new Date(`${date} ${block?.block.hour_start}`),
			new Date(`${date} ${block?.block.hour_finish}`),
		])
		for (const date of dates) {
			if (!firstDate || dateIsBefore(date, firstDate)) firstDate = date
			if (!lastDate || dateIsAfter(date, lastDate)) lastDate = date
		}
	}
	if (firstDate && lastDate) {
		work.value.date_start = formateDateInput(firstDate)
		work.value.time_start = getOnlyTime(firstDate)

		work.value.date_limit = formateDateInput(lastDate)
		work.value.time_limit = getOnlyTime(lastDate)
	}
	const updated = await $workService.updateWork(
		work.value,
		dates,
		timeAccess.value,
		filesAttached.value,
		linksAttached.value,
	)
	if (updated) router.push('../../../trabajos')
}

function addDate() {
	try {
		const block = blocks.value?.find(
			({ _id }) => _id === selectedSession.value?.block,
		)
		const day = new Date(newDate.value).getDay()
		if (dayStringToNumber(block?.day ?? '') !== day)
			throw new Error(`La fecha debe ser un dia ${block?.day}`)
		if (selectedSession.value?.dates.includes(newDate.value))
			throw new Error(`La fecha ya está incluida`)

		selectedSession.value?.dates.push(newDate.value)

		modalDate.value = false
		newDate.value = ''
	} catch (err) {
		if (err instanceof Error)
			toastsStore.addToast({
				type: 'error',
				message: err.message,
			})
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
			<!-- Head -->
			<Head>
				<Title>{{ title }}</Title>
				<Meta name="robots" content="noindex, nofollow" />
			</Head>
			<!-- Body -->
			<HTMLForm :form="updateWork">
				<label for="title">Titulo trabajo</label>
				<HTMLInput id="title" v-model:value="work.title" />
				<label for="">Descripci&oacute;n del trabajo (Opcional)</label>
				<HTMLTextArea v-model:value="work.description" />
				<template v-if="work.is_qualified && gradePrograms">
					<label for="grade">Calificaci&oacute;n asignada</label>
					<HTMLSelect id="grade" v-model:value="work.grade._id">
						<option value="">Seleccione una opci&oacute;n</option>
						<!-- eslint-disable vue/no-v-for-template-key -->
						<template
							v-for="gradeProgram in gradePrograms"
							:key="gradeProgram._id"
						>
							<option
								v-if="!gradeProgram.is_acumulative"
								:value="gradeProgram._id"
							>
								{{ gradeProgram.number }}° ({{
									gradeProgram.percentage
								}}%)
							</option>
							<option
								v-for="acumulative in gradeProgram.acumulative"
								v-else
								:key="acumulative._id"
								:value="acumulative._id"
							>
								{{ gradeProgram.number }}
								[{{ acumulative.number }}° ({{
									acumulative.percentage
								}}%)]° ({{ gradeProgram.percentage }}%)
							</option>
						</template>
					</HTMLSelect>
				</template>
				<!-- Time -->
				<h3><i class="fa-solid fa-hourglass" /> Sesiones</h3>
				<small
					><i
						>¿Cu&aacute;ndo se pretende realizar el trabajo?</i
					></small
				>
				<!-- Sessions -->
				<HTMLMultiple
					id="blocks"
					legend="Bloques de clase"
					:options="
						blocks?.map(({ _id, block, day }) => ({
							value: `${day} ${block.hour_start} - ${block.hour_finish} (${block.number})`,
							key: _id ?? '',
						})) ?? []
					"
					:value="work.sessions?.map(({ block }) => block)"
					@update:value="
						(blocks: Array<string>) => {
							if (work)
								work.sessions = blocks.map((block) => ({
									block,
									dates: work?.sessions?.find(({ block: blockSession }) => blockSession === block)?.dates ?? [],
								}))
						}
					"
				/>
				<div class="Sessions">
					<article v-for="(session, i) in sessions" :key="i">
						<h4>
							<i class="fa-solid fa-calendar-day"></i>
							Fechas bloque
							{{ session.block?.day }}
							{{ session.block?.block.hour_start }} -
							{{ session.block?.block.hour_finish }}
							({{ session.block?.block.number }})
						</h4>
						<div class="Sessions__dates">
							<div
								v-for="(date, j) in session.dates"
								:key="j"
								class="Sessions__date"
							>
								{{ formatDateLL(date) }}
								<HTMLButtonIcon
									:click="
										() =>
											work?.sessions
												?.at(i)
												?.dates.splice(j, 1)
									"
									class-item="fa-solid fa-minus"
									:one-hundred="false"
								/>
							</div>
						</div>
						<!-- Add date -->
						<HTMLButtonIcon
							:click="
								() => {
									modalDate = true
									selectedSession =
										work?.sessions?.at(i) ?? null
								}
							"
							class-item="fa-solid fa-circle-plus"
							title="Añadir fecha"
						/>
					</article>
				</div>
				<!-- /Time -->
				<h3>
					<i class="fa-solid fa-paperclip" />
					Adjuntos (Opcional) *Eliminaci&oacute;n asincr&oacute;nica
				</h3>
				<section class="Attached">
					<CloudFile
						v-for="(file, i) in filesAttached"
						:key="getFileID(file._id)"
						:id-module="idModule"
						:edit="true"
						:is-classroom="true"
						:file="file"
						:can-download="true"
						@delete="() => deleteFile(i)"
					/>
					<ClassLink
						v-for="(link, i) in linksAttached"
						:key="i"
						:delete-me="() => deleteLink(i)"
						:edit="true"
						:link="link"
					/>
				</section>
				<ClassAttached
					@new-file="(f: Array<UserFile>) => filesAttached = f"
					@new-link="(l: Link) => linksAttached.push(l)"
				/>
				<HTMLButton type="submit">Editar trabajo</HTMLButton>
			</HTMLForm>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</section>
		<!-- Modals -->
		<Modal v-model:opened="modalDate">
			<template #title>
				<h2>Añadir fecha</h2>
			</template>
			<HTMLForm :form="addDate">
				<label for="date">Fecha realizaci&oacute;n</label>
				<HTMLInput id="date" v-model:value="newDate" type="date" />

				<HTMLButton type="submit"> Añadir fecha </HTMLButton>
			</HTMLForm>
		</Modal>
	</NuxtLayout>
</template>

<style scoped>
.dark-mode .NewWork {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .NewWork {
	box-shadow: var(--box-shadow);
}

.NewWork {
	background-color: white;
	margin: 20px;
	padding: 15px;
	border-radius: 10px;
	margin-bottom: 80vh;
}

.Sessions__dates {
	display: flex;
	flex-wrap: wrap;
	padding: 8px;
	gap: 10px;
	justify-content: center;
}

.Sessions__date {
	padding: 8px;
	border: 2px solid var(--color-light);
	border-radius: 3px;
	display: flex;
	gap: 5px;
	align-items: center;
	width: fit-content;
}

.Attached {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

@media (max-width: 767.98px) {
	.NewWork {
		margin: 15px;
	}

	h2 {
		font-size: 1.4rem;
	}

	h3 {
		font-size: 1rem;
	}
}

@media (max-width: 575.98px) {
	.NewWork {
		margin: 10px;
		padding: 10px;
	}

	h2 {
		font-size: 1.2rem;
	}

	h3 {
		font-size: 0.95rem;
	}
}
</style>
