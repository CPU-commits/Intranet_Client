<script setup lang="ts">
// Types
import type { User } from '~~/models/user/user.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Apoderados - Masivo - Admin - ${schoolName} - Intranet`
	: 'Apoderados - Masivo - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR],
})
// Router
const router = useRouter()
// Nuxtapp
const { $parentService } = useNuxtApp()

// Data
const parents = ref<Array<User>>([])

function deleteCell(position: number) {
	parents.value.splice(position, 1)
}

// Upload data
async function uploadParents() {
	const dataFetch = await $parentService.uploadParents(parents.value)
	if (dataFetch) router.push('/admin/apoderados')
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
		<AdminMassive
			v-model:data="parents"
			:upload="uploadParents"
			title="apoderados"
			:generic="{
				name: '',
				first_lastname: '',
				second_lastname: '',
				rut: '',
			}"
			excel-file="Apoderados Masivo.xlsx"
		>
			<HTMLTable :header="['Nombre', 'Ap. P', 'Ap. M', 'RUT', '']">
				<tr v-for="(parent, i) in parents" :key="i">
					<td>
						<HTMLInput :id="`N${i}`" v-model:value="parent.name" />
					</td>
					<td>
						<HTMLInput
							:id="`FL${i}`"
							v-model:value="parent.first_lastname"
						/>
					</td>
					<td>
						<HTMLInput
							:id="`SL${i}`"
							v-model:value="parent.second_lastname"
						/>
					</td>
					<td>
						<HTMLInput :id="`R${i}`" v-model:value="parent.rut" />
					</td>
					<td>
						<HTMLButtonIcon
							:click="() => deleteCell(i)"
							class-item="fa-solid fa-minus"
						/>
					</td>
				</tr>
			</HTMLTable>
		</AdminMassive>
	</NuxtLayout>
</template>
