<script setup lang="ts">
import { ErrorFetch } from '~/common/fetchModule'

// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Usuario - ${schoolName} - Intranet`
	: 'Usuario - Intranet'
// NuxtApp
const { $reportService } = useNuxtApp()
// Stores
const errorStore = useErrorStore()
// Modals
const modalReport = ref(false)

// Form
const report = ref({
	type: 'func',
	description: '',
})
const index = ref<number | null>(null)
const errorForm = ref<ErrorFetch | null>(null)

async function uploadReport() {
	const success = await $reportService.uploadReport(
		report.value,
		errorForm?.value ? errorForm.value : undefined,
	)
	if (success && index.value !== null) {
		errorStore.spliceOne(index.value)
	}
}
</script>

<template>
	<User>
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<template #title>
			<h2>Reporte de errores</h2>
		</template>
		<HTMLButtonIcon
			class-item="fa-solid fa-triangle-exclamation"
			:click="() => (modalReport = true)"
			title="Reportar"
		>
			Reporte personalizado
		</HTMLButtonIcon>
		<div class="Container">
			<section class="ContentData">
				<ClientOnly>
					<ErrorCard
						v-for="(error, i) in errorStore.errors"
						:key="i"
						:number="i"
						:error="error"
						@report="
							(error) => {
								modalReport = true
								errorForm = error.error
								index = error.index
							}
						"
					/>
				</ClientOnly>
			</section>
		</div>

		<!-- Modals -->
		<Modal v-model:opened="modalReport">
			<template #title>
				<h2>Generar reporte</h2>
			</template>
			<HTMLForm :form="uploadReport">
				<label for="type">Tipo de reporte</label>
				<HTMLSelect id="type" v-model:value="report.type">
					<option value="func">Funcional</option>
					<option value="loading">
						No se carg&oacute; la p&aacute;gina
					</option>
					<option value="save-data">
						Error al guardar informaci&oacute;n
					</option>
					<option value="unreadable">Error ilegible</option>
					<option value="conflict">Conflicto</option>
					<option value="no-follow">
						No me permiti&oacute; seguir
					</option>
					<option value="connection">Error de conexi&oacute;n</option>
					<option value="flow">Flujo de trabajo incorrecto</option>
					<option value="format">
						Formato inv&aacute;lido de formulario
					</option>
					<option value="freeze">
						Se congel&oacute; la aplicaci&oacute;n
					</option>
					<option value="other">Otro</option>
				</HTMLSelect>
				<label for="description">
					Breve descripci&oacute;n (Opcional)
				</label>
				<HTMLTextArea
					id="description"
					v-model:value="report.description"
				/>
				<HTMLButton type="submit">Reportar</HTMLButton>
			</HTMLForm>
		</Modal>
	</User>
</template>

<style scoped>
.Container {
	display: flex;
	justify-content: center;
}

.ContentData {
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	width: 100%;
}

@media (max-width: 575.98px) {
	h2 {
		font-size: 1.2rem;
	}
}
</style>
