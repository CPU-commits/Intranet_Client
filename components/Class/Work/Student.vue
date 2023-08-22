<!-- eslint-disable camelcase -->
<!-- eslint-disable vue/no-setup-props-destructure -->
<!-- eslint-disable vue/prop-name-casing -->
<script setup lang="ts">
// Types
import { FormAccess } from '~~/models/classroom/form_access.model'
import { Grade } from '~~/models/classroom/grade.model'
import { Work } from '~~/models/classroom/work.model'
import { FilesUploadedClassroom } from '~~/models/file/files_uploaded.model'
import { dateIsAfter } from '~~/utils/dates'
import { formatDate, formatGrade, secondsToHoursFormat } from '~~/utils/format'
import { getIcon } from '~~/utils/getIcon'

// Props
const { work, files_uploaded, form_access, grade, idModule } = defineProps<{
	work: Work
	form_access: FormAccess
	files_uploaded: FilesUploadedClassroom
	grade: Grade
	idModule: string
}>()
// Nuxtapp
const { $workService } = useNuxtApp()
// Router
const router = useRouter()

// Values
const message = ref('')
const files = ref<FileList | null>(null)
const filesStored = ref<Array<File>>([])
// Modal
const modal = ref(false)
const modalRev = ref(false)

if (!form_access) {
	message.value = 'Abrir formulario'
} else if (form_access.status === 'opened') {
	message.value = 'Seguir con el último intento'
} else if (form_access.status === 'finished') {
	message.value = 'Revisar respuestas'
} else if (form_access.status === 'revised') {
	message.value = 'Ir a la revisión'
}

function addList() {
	if (files.value) {
		for (let i = 0; i < files.value.length; i++)
			filesStored.value.push(files.value[i])
	}
}

function removeList(index: number) {
	filesStored.value.splice(index, 1)
}

async function uploadFiles() {
	const uploaded = await $workService.uploadFiles(filesStored.value, work._id)
	if (uploaded) router.push('../trabajos')
}

// $oid undefined, id is the real _id

async function deleteFile(id: string) {
	const deleted = await $workService.deleteFileWork(id, work._id)
	if (deleted)
		files_uploaded.files_uploaded = files_uploaded.files_uploaded.filter(
			(file) => file._id !== id,
		)
}

function getPointsEvaluated(pattern: string) {
	const index = files_uploaded.evaluate?.findIndex(
		(i) => i.pattern === pattern,
	)
	return files_uploaded.evaluate[index].points
}
</script>

<template>
	<section
		v-if="
			dateIsBefore(work.date_limit, new Date()) ||
			work.type !== 'in-person'
		"
	>
		<template v-if="work.type === 'form'">
			<span v-if="work.form_access === 'wtime'">
				Tiempo de acceso una vez abierto:
				{{ secondsToHoursFormat(work.time_access) }} Hrs.
			</span>
			<span v-else>
				Tiempo de acceso una vez abierto: Hasta el cierre del trabajo
			</span>
			<div class="Form__Button">
				<HTMLAButton
					:prefetch="false"
					:href="`/aula_virtual/formulario/${work._id}`"
				>
					{{ message }}
				</HTMLAButton>
			</div>
		</template>
		<template v-else-if="work.type === 'files'">
			<template v-if="!work.is_revised">
				<h3>Subir archivos</h3>
				<HTMLInputFiles
					id="files"
					v-model:files="files"
					:multiple="true"
					:on-change="addList"
				/>
			</template>
			<section class="Files">
				<article v-for="(file, i) in filesStored" :key="i" class="File">
					<h3>
						<i :class="getIcon(file.type)" />
						{{ file.name }}
					</h3>
					<HTMLButtonIcon
						:click="() => removeList(i)"
						class-item="fa-solid fa-xmark"
					/>
				</article>
				<h4>
					<i class="fa-solid fa-file-arrow-up" /> Archivos subidos
				</h4>
				<div class="Files">
					<CloudFile
						v-for="(file, i) in files_uploaded.files_uploaded"
						v-if="files_uploaded"
						:key="i"
						:id-module="idModule"
						:id-classroom="true"
						:edit="!work.is_revised"
						:can-download="true"
						:file="file"
						@delete="() => deleteFile(getFileID(file._id))"
					/>
					<span v-else>Sin archivos subidos...</span>
				</div>
				<span v-if="files_uploaded">
					Fecha de subida:
					<span
						:class="
							dateIsAfter(files_uploaded.date, work.date_limit)
								? 'Fail'
								: 'Success'
						"
					>
						{{ formatDate(files_uploaded.date) }}
					</span>
				</span>
			</section>
			<div v-if="!work.is_revised" class="Form__Button">
				<HTMLButton :click="uploadFiles" type="button">
					Subir archivos
				</HTMLButton>
			</div>
		</template>

		<section v-if="work.is_revised" class="Grade">
			<span>
				Calificaci&oacute;n final:
				<span class="Color">
					{{ formatGrade(grade.grade) }}
				</span>
			</span>
			<small>
				Calificado por:
				<span class="Color">
					<span v-if="grade.evaluator?.name">
						{{ grade.evaluator.name }}
						{{ grade.evaluator.first_lastname }}
					</span>
					<span v-else>
						<i class="fa-solid fa-robot" />
						Calificaci&oacute;n autom&aacute;tica
					</span>
				</span>
			</small>
			<small>
				Fecha evaluaci&oacute;n:
				{{ formatDate(grade.date) }}
			</small>
			<footer
				v-if="work.type === 'files' && work.is_revised"
				class="Revise"
			>
				<HTMLButton :click="() => (modalRev = true)" type="button">
					Ver revisi&oacute;n
				</HTMLButton>
			</footer>
		</section>

		<div v-if="work.type === 'files'" class="Pattern">
			<HTMLButtonIcon
				:one-hundred="false"
				:click="() => (modal = true)"
				title="Rubrica de evaluación"
				class-item="fa-solid fa-scroll"
			>
				Pauta
			</HTMLButtonIcon>
		</div>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Pauta</h2>
			</template>
			<HTMLTable :header="['Titulo', 'Descr.', 'Pts.']">
				<tr v-for="item in work.pattern" :key="item._id">
					<td>{{ item.title }}</td>
					<td>{{ item.description }}</td>
					<td>{{ item.points }}</td>
				</tr>
			</HTMLTable>
		</Modal>

		<Modal v-model:opened="modalRev">
			<template #title>
				<h2>Pauta</h2>
			</template>
			<HTMLTable
				:header="['Titulo', 'Descr.', 'Pts. Máx.', 'Pts. Obtenido']"
			>
				<tr v-for="item in work.pattern" :key="item._id">
					<td>{{ item.title }}</td>
					<td>{{ item.description }}</td>
					<td>{{ item.points }}</td>
					<td>
						{{ getPointsEvaluated(item._id ?? '') }}
					</td>
				</tr>
			</HTMLTable>
		</Modal>
	</section>
</template>

<style lang="scss" scoped>
.Form__Button {
	width: fit-content;
}

.Grade {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.Color {
	color: var(--color-main);
	font-weight: bold;
	i {
		color: var(--color-main);
	}
	span {
		color: var(--color-main);
		i {
			color: var(--color-main);
		}
	}
}

.Files {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	width: 100%;
}

.File {
	display: flex;
	gap: 10px;
}

.File h3 {
	display: flex;
	gap: 10px;
	align-items: center;
}

h4 {
	width: 100%;
	padding: 10px;
	text-align: center;
}

.Pattern {
	display: flex;
	gap: 5px;
}

.File i {
	color: var(--color-main);
}

.Success {
	color: var(--color-main);
}

.Fail {
	color: var(--color-danger);
}

.Revise {
	margin-top: 10px;
}

@media (max-width: 767.98px) {
	.Form__Button a {
		font-size: 0.9rem;
	}
}

@media (max-width: 575.98px) {
	span,
	.Grade span {
		font-size: 0.8rem;
	}

	.Form__Button a {
		font-size: 0.75rem;
	}

	.Grade {
		margin-top: 10px;
	}

	small {
		font-size: 0.7rem;
	}
}
</style>
