<script setup lang="ts">
// Types
import type { User } from '~~/models/user/user.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Directivos - Masivo - Admin - ${schoolName} - Intranet`
	: 'Directivos - Masivo - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR],
})
// Router
const router = useRouter()
// Nuxtapp
const { $directivesService } = useNuxtApp()

// Data
const directives = ref<Array<User>>([
	{
		name: '',
		first_lastname: '',
		second_lastname: '',
		rut: '',
	} as User,
])
// Modal
const modal = ref(false)
// Cells
const cells = ref(0)

function deleteCell(position: number) {
	directives.value.splice(position, 1)
}

function addCells() {
	for (let i = 0; i < cells.value; i++) {
		directives.value.push({
			name: '',
			first_lastname: '',
			second_lastname: '',
			rut: '',
		} as User)
	}
	cells.value = 0
	modal.value = false
}
// Upload data
async function uploadDirectives() {
	const dataFetch = await $directivesService.uploadDirectives(
		directives.value,
	)
	if (dataFetch) router.push('/admin/directivos')
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
		<AdminPanel>
			<template #nav>
				<Icons>
					<HTMLButtonIcon
						title="Agregar celdas"
						class-item="fa-solid fa-plus"
						:click="() => (modal = true)"
					/>
					<HTMLButtonIcon
						title="Subir directivos"
						class-item="fa-solid fa-arrow-up-from-bracket"
						:click="uploadDirectives"
					/>
				</Icons>
			</template>
			<h2>Tabla directivos</h2>
			<br />
			<HTMLTable :header="['Nombre', 'Ap. P', 'Ap. M', 'RUT', '']">
				<tr v-for="(directive, i) in directives" :key="i">
					<td>
						<HTMLInput
							:id="`N${i}`"
							v-model:value="directive.name"
						/>
					</td>
					<td>
						<HTMLInput
							:id="`FL${i}`"
							v-model:value="directive.first_lastname"
						/>
					</td>
					<td>
						<HTMLInput
							:id="`SL${i}`"
							v-model:value="directive.second_lastname"
						/>
					</td>
					<td>
						<HTMLInput
							:id="`R${i}`"
							v-model:value="directive.rut"
						/>
					</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteCell(i)"
							class-item="fa-solid fa-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
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
	</NuxtLayout>
</template>
