<script setup lang="ts">
const props = defineProps<{
	upload: (data: Array<any>) => any
	title: string
	generic: any
	data: Array<any>
	excelFile: string
}>()

const emits = defineEmits<{
	(e: 'update:data', data: Array<any>): void
}>()

// Nuxt
const { $filesService, $fetchModule } = useNuxtApp()
// Stores
const toastsStore = useToastsStore()

// Data
const files = ref<FileList | null>(null)
props.data.push(Object.create(props.generic))

emits('update:data', props.data)
// Modal
const modal = ref(false)
const modalExcel = ref(false)
// Cells
const cells = ref(0)

function addCells() {
	for (let i = 0; i < cells.value; i++) {
		props.data.push(Object.create(props.generic))
	}
	cells.value = 0
	modal.value = false
	// Emit value
	emits('update:data', props.data)
}

async function importExcelData() {
	try {
		if (files.value) {
			const data = await $filesService.importExcelData(
				files.value[0],
				['Hoja1'],
				[
					{ key: 'Nombre', value: 'name' },
					{ key: 'Apellido Paterno', value: 'first_lastname' },
					{ key: 'Apellido Materno', value: 'second_lastname' },
					{ key: 'RUT', value: 'rut' },
					{ key: 'Matricula', value: 'registration_number' },
				],
			)

			const genericKeys = Object.keys(props.generic)
			data.excelData[0].values.forEach((obj) => {
				if (!Object.keys(obj).every((key) => genericKeys.includes(key)))
					throw new Error(
						'No está usando el formato original de Excel',
					)
			})
			// Load values
			if (data.excelData[0].values.length > 0)
				emits('update:data', [
					...props.data,
					...data.excelData[0].values,
				])

			// Default
			files.value = null
			modalExcel.value = false
		}
	} catch (err) {
		const error = $fetchModule.handleError(err)
		toastsStore.addToast({
			message: error.message,
			type: 'error',
		})
	}
}
</script>

<template>
	<div>
		<AdminPanel>
			<template #nav>
				<Icons>
					<HTMLButtonIcon
						title="Agregar celdas"
						class-item="fa-solid fa-plus"
						:click="() => (modal = true)"
					/>
					<HTMLButtonIcon
						title="Importar excel"
						class-item="fa-solid fa-file-excel"
						:click="() => (modalExcel = true)"
					/>
					<HTMLButtonIcon
						:title="`Subir ${title}`"
						class-item="fa-solid fa-arrow-up-from-bracket"
						:click="() => upload(data)"
					/>
				</Icons>
			</template>
			<h2>Tabla {{ title }}</h2>
			<br />
			<slot />
		</AdminPanel>

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Agregar celdas</h2>
			</template>
			<HTMLForm :form="addCells">
				<label for="cells">Cantidad de celdas</label>
				<HTMLInput id="cells" v-model:value="cells" type="number" />
				<HTMLButton type="submit">Agregar celdas</HTMLButton>
			</HTMLForm>
		</Modal>

		<Modal v-model:opened="modalExcel">
			<template #title>
				<h2>Importar datos desde Excel</h2>
			</template>
			<HTMLForm :form="importExcelData">
				<HTMLInputFiles v-model:files="files" />
				<HTMLButton type="submit"> Importar documento </HTMLButton>
			</HTMLForm>
			<br />
			<HTMLADownload
				class-item="fa-solid fa-file-arrow-down"
				:href="`/files/${excelFile}`"
			/>
		</Modal>
	</div>
</template>

<style scoped>
div {
	width: 100%;
}
</style>
