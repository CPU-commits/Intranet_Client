<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { GradeProgram } from '~~/models/classroom/grade.model'
import { WorkType } from '~~/models/classroom/work.model'
import { UserFile } from '~~/models/file/file.model'
import type { UserForm } from '~~/models/form/form.model'
import { formatDate } from '~~/utils/format'
import { UserTypesKeys } from '~~/models/user/user.model'
type Item = {
	title: string
	description: string
	points: number
}
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
const { $fetchModule, $workService, $gradesService, $formService } =
	useNuxtApp()
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

// Form
const newWork = reactive({
	title: '',
	description: '',
	is_qualified: '',
	grade: '',
	type: '' as keyof typeof WorkType,
	form: '',
	pattern: [] as Item[],
	date_start: '',
	time_start: '',
	date_limit: '',
	time_limit: '',
	form_access: '',
	time_access: '',
	virtual: true,
})
const linksAttached = ref<Array<Link>>([])
const filesAttached = ref<Array<UserFile>>([])

// Data
const gradePrograms = ref<Array<GradeProgram> | null>(null)
const forms = ref<Array<UserForm> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$gradesService.getGradePrograms(idModule),
			$formService.getForms(),
		])
		gradePrograms.value = dataFetch[0]
		forms.value = dataFetch[1]
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

function addItem() {
	newWork.pattern.push({
		title: '',
		description: '',
		points: 0,
	})
}

function deleteItem(index: number) {
	newWork.pattern.splice(index, 1)
}

function deleteFile(index: number) {
	filesAttached.value.splice(index, 1)
}

function deleteLink(index: number) {
	linksAttached.value.splice(index, 1)
}

async function uploadWork() {
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
		<section v-if="forms" class="NewWork">
			<!-- Head -->
			<Head>
				<Title>{{ title }}</Title>
				<Meta name="robots" content="noindex, nofollow" />
			</Head>
			<!-- Body -->
			<h2>Nuevo trabajo</h2>
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
				<label for="type">Tipo de trabajo</label>
				<HTMLSelect id="type" v-model:value="newWork.type">
					<option value="">Seleccione una opci&oacute;n</option>
					<option value="files">
						Subida de archivos a calificar
					</option>
					<option value="form">Formulario</option>
				</HTMLSelect>
				<template v-if="newWork.type === 'form'">
					<label for="form"
						><i class="fa-solid fa-clipboard" /> Formulario
						asignado</label
					>
					<HTMLSelect id="form" v-model:value="newWork.form">
						<option value="">Seleccione una opci&oacute;n</option>
						<option
							v-for="form in forms"
							:key="form._id"
							:value="form._id"
						>
							{{ form.title }}
							{{
								form.has_points
									? '(Con puntaje)'
									: '(Sin puntaje)'
							}}
							{{ formatDate(form.upload_date) }}
						</option>
					</HTMLSelect>
				</template>
				<template v-else-if="newWork.type === 'files'">
					<h3>
						<i class="fa-solid fa-scroll" /> Pauta entrega de
						archivo(s)
					</h3>
					<HTMLTable :header="['Titulo', 'Desc.', 'Puntaje', '']">
						<tr v-for="(item, i) in newWork.pattern" :key="i">
							<td><HTMLInput v-model:value="item.title" /></td>
							<td>
								<HTMLTextArea
									v-model:value="item.description"
								/>
							</td>
							<td>
								<HTMLInput
									v-model:value="item.points"
									type="number"
								/>
							</td>
							<td>
								<HTMLButtonIcon
									title="Eliminar item"
									:click="() => deleteItem(i)"
									class-item="fa-solid fa-circle-minus"
								/>
							</td>
						</tr>
					</HTMLTable>
					<HTMLButtonIcon
						:click="addItem"
						title="Añadir nuevo item a la pauta"
						class-item="fa-solid fa-plus"
					/>
				</template>
				<!-- Time -->
				<h3><i class="fa-solid fa-hourglass" /> Tiempo</h3>
				<!-- Start -->
				<label for="">Fecha inicio acceso al trabajo</label>
				<HTMLInput
					id="limit"
					v-model:value="newWork.date_start"
					type="date"
				/>
				<label for="">Hora inicio acceso al trabajo</label>
				<HTMLInput
					id="limit"
					v-model:value="newWork.time_start"
					type="time"
				/>
				<!-- Limit -->
				<label for="limit">Fecha l&iacute;mite acceso al trabajo</label>
				<HTMLInput
					id="limit"
					v-model:value="newWork.date_limit"
					type="date"
				/>
				<label for="">Hora l&iacute;mite acceso al trabajo</label>
				<HTMLInput
					id="limit"
					v-model:value="newWork.time_limit"
					type="time"
				/>
				<!-- /Time -->
				<template v-if="newWork.type === 'form'">
					<label for="access">Tipo de acceso al formulario</label>
					<HTMLSelect id="access" v-model:value="newWork.form_access">
						<option value="">
							Hasta fecha y hora l&iacute;mite
						</option>
						<option value="wtime">Con tiempo l&iacute;mite</option>
					</HTMLSelect>
				</template>
				<template
					v-if="
						newWork.type === 'form' &&
						newWork.form_access === 'wtime'
					"
				>
					<label for="time_access"
						>Tiempo de acceso al formulario (Horas:Minutos)</label
					>
					<HTMLInput
						id="time_access"
						v-model:value="newWork.time_access"
						type="time"
					/>
				</template>
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
