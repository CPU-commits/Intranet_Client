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
const directives = ref<Array<User>>([])

function deleteCell(position: number) {
	directives.value.splice(position, 1)
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
		<AdminMassive
			v-model:data="directives"
			:upload="uploadDirectives"
			title="directivos"
			:generic="{
				name: '',
				first_lastname: '',
				second_lastname: '',
				rut: '',
			}"
			excel-file="Directivos Masivo.xlsx"
		>
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
		</AdminMassive>
	</NuxtLayout>
</template>
