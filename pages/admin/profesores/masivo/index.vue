<script setup lang="ts">
// Types
import type { User } from '~~/models/user/user.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Profesores - Masivo - Admin - ${schoolName} - Intranet`
	: 'Profesores - Masivo - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxt app
const { $teacherService } = useNuxtApp()
// Router
const router = useRouter()

// Data
const teachers = ref<Array<Omit<Omit<User, '_id'>, 'user_type'>>>([])

function deleteCell(position: number) {
	teachers.value.splice(position, 1)
}

// Upload data
async function uploadTeachers() {
	const dataFetch = await $teacherService.uploadTeachers(teachers.value)
	if (dataFetch) router.push('/admin/profesores')
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
			v-model:data="teachers"
			:upload="uploadTeachers"
			title="profesores"
			:generic="{
				name: '',
				first_lastname: '',
				second_lastname: '',
				rut: '',
			}"
			excel-file="Profesores Masivo.xlsx"
		>
			<HTMLTable :header="['Nombre', 'Ap. P', 'Ap. M', 'RUT', '']">
				<tr v-for="(teacher, i) in teachers" :key="i">
					<td>
						<HTMLInput :id="`N${i}`" v-model:value="teacher.name" />
					</td>
					<td>
						<HTMLInput
							:id="`FL${i}`"
							v-model:value="teacher.first_lastname"
						/>
					</td>
					<td>
						<HTMLInput
							:id="`SL${i}`"
							v-model:value="teacher.second_lastname"
						/>
					</td>
					<td>
						<HTMLInput :id="`R${i}`" v-model:value="teacher.rut" />
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
