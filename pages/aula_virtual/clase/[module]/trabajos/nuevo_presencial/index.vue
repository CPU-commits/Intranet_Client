<script setup lang="ts">
// Types
import { CalendarBlock } from '~/models/calendar/block.model'
import { RegisteredCalendarBlock } from '~/models/calendar/calendar.model'
import { ErrorFetch } from '~~/common/fetchModule'
import type { GradeProgram } from '~~/models/classroom/grade.model'
import type { WorkType } from '~~/models/classroom/work.model'
import { UserFile } from '~~/models/file/file.model'
import { UserTypesKeys } from '~~/models/user/user.model'

type Link = {
	title: string
	link: string
}
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(
	schoolName
		? `- Nuevo trabajo - ${schoolName} - Intranet`
		: `- Nuevo trabajo - Intranet`,
)
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.TEACHER],
})
// Nuxtapp
const {
	$fetchModule,
	$workService,
	$gradesService,
	$calendarService,
	$moduleService,
} = useNuxtApp()
// Stores
const toastsStore = useToastsStore()
// Router
const route = useRoute()
const router = useRouter()

const idModule = route.params.module
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
		fatal: true,
	})

// Modal
const modalDate = ref(false)
// Form
const newWork = reactive({
	title: '',
	description: '',
	is_qualified: '',
	grade: '',
	type: 'in-person' as keyof typeof WorkType,
	date_start: '',
	time_start: '',
	date_limit: '',
	time_limit: '',
	form_access: '',
	time_access: '',
	virtual: false,
	sessions: [] as Array<{
		block: string
		dates: Array<string>
	}>,
})
const selectedSession = ref<{
	block: string
	dates: Array<string>
} | null>(null)
const newDate = ref('')
const sessions = computed(() => {
	return newWork.sessions.map((session) => ({
		dates: session.dates,
		block: blocks.value?.find(({ _id }) => _id === session.block),
	}))
})

const linksAttached = ref<Array<Link>>([])
const filesAttached = ref<Array<UserFile>>([])
// Data
const blocks = ref<Array<
	Omit<RegisteredCalendarBlock, 'block'> & {
		block: CalendarBlock
	}
> | null>(null)
const gradePrograms = ref<Array<GradeProgram> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$gradesService.getGradePrograms(idModule),
			$moduleService.getModule(idModule),
		]).then(async (data) => ({
			programs: data[0],
			blocks: await $calendarService.getRegisteredsBlockBySubjectNSection(
				data[1].subject._id,
				data[1].section._id,
			),
		}))
		gradePrograms.value = dataFetch.programs
		blocks.value = dataFetch.blocks
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

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

function deleteFile(index: number) {
	filesAttached.value.splice(index, 1)
}

function deleteLink(index: number) {
	linksAttached.value.splice(index, 1)
}

async function uploadWork() {
	let firstDate: Date | null = null
	let lastDate: Date | null = null
	for (const session of newWork.sessions) {
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
		newWork.date_start = formateDateInput(firstDate)
		newWork.time_start = getOnlyTime(firstDate)

		newWork.date_limit = formateDateInput(lastDate)
		newWork.time_limit = getOnlyTime(lastDate)
	}

	const uploaded = await $workService.uploadWork(
		newWork,
		filesAttached.value,
		linksAttached.value,
		idModule as string,
	)
	if (uploaded) router.push(`/aula_virtual/clase/${idModule}/trabajos`)
}
</script>

<template>
	<NuxtLayout name="class">
		<section v-if="gradePrograms" class="NewWork">
			<!-- Head -->
			<Head>
				<Title>{{ title }}</Title>
				<Meta name="robots" content="noindex, nofollow" />
			</Head>
			<!-- Body -->
			<h2>Nuevo trabajo presencial</h2>
			<br />
			<HTMLForm :form="uploadWork">
				<label for="title">Titulo trabajo</label>
				<HTMLInput id="title" v-model:value="newWork.title" />
				<label for="">Descripci&oacute;n del trabajo (Opcional)</label>
				<HTMLTextArea v-model:value="newWork.description" />
				<label for="qualified">Calificaci&oacute;n trabajo</label>
				<HTMLSelect id="qualified" v-model:value="newWork.is_qualified">
					<option value="">Seleccione una opci&oacute;n</option>
					<option value="true">Calificado</option>
					<option value="false">No calificado</option>
				</HTMLSelect>
				<template
					v-if="newWork.is_qualified === 'true' && gradePrograms"
				>
					<label for="grade">Calificaci&oacute;n asignada</label>
					<HTMLSelect id="grade" v-model:value="newWork.grade">
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
							key: _id,
						}))
					"
					@update:value="
						(blocks: Array<string>) => (newWork.sessions = blocks.map((block) => ({
							block,
							dates: newWork.sessions.find(({ block: blockSession }) => blockSession === block)?.dates ?? [],
						})))
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
											newWork.sessions[i].dates.splice(
												j,
												1,
											)
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
									selectedSession = newWork.sessions[i]
								}
							"
							class-item="fa-solid fa-circle-plus"
							title="Añadir fecha"
						/>
					</article>
				</div>

				<!-- /Time -->
				<h3><i class="fa-solid fa-paperclip" /> Adjuntos (Opcional)</h3>
				<section class="Attached">
					<CloudFile
						v-for="(file, i) in filesAttached"
						:key="getFileID(file._id)"
						:is-classroom="true"
						:id-module="idModule"
						:edit="true"
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
				<HTMLButton type="submit">Publicar</HTMLButton>
			</HTMLForm>
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
