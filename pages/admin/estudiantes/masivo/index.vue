<script setup lang="ts">
// Types
import { ErrorFetch } from '~/common/fetchModule'
import { Section } from '~/models/course/course.model'
import type { Student } from '~~/models/user/student.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Estudiantes - Masivo - Admin - ${schoolName} - Intranet`
	: 'Estudiantes - Masivo - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE],
})
// Nuxtapp
const { $studentsService, $fetchModule, $courseService } = useNuxtApp()
// Router
const router = useRouter()

// Data
const students = ref<
	Array<
		Omit<Omit<Omit<Student, '_id'>, 'user_type'>, 'course'> & {
			course: string
		}
	>
>([])
const sections = ref<Array<Section> | null>(null)
const error = ref<ErrorFetch | null>(null)

function deleteCell(position: number) {
	students.value.splice(position, 1)
}

onMounted(async () => {
	try {
		const dataFetch = await $courseService.getSections()
		sections.value = dataFetch
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

// Upload data
async function uploadStudents(
	students: Array<
		Omit<Omit<Omit<Student, '_id'>, 'user_type'>, 'course'> & {
			course: string
		}
	>,
) {
	const dataFetch = await $studentsService.uploadStudents(students)
	if (dataFetch) router.push('/admin/estudiantes')
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
			v-model:data="students"
			:upload="uploadStudents"
			title="estudiantes"
			:generic="{
				name: '',
				first_lastname: '',
				second_lastname: '',
				rut: '',
				registration_number: '',
			}"
			excel-file="Estudiantes Masivo.xlsx"
		>
			<HTMLTable
				:header="[
					'Nombre',
					'Ap. P',
					'Ap. M',
					'RUT',
					'Matricula',
					'Curso',
					'',
				]"
			>
				<tr v-for="(student, i) in students" :key="i">
					<td>
						<HTMLInput :id="`N${i}`" v-model:value="student.name" />
					</td>
					<td>
						<HTMLInput
							:id="`FL${i}`"
							v-model:value="student.first_lastname"
						/>
					</td>
					<td>
						<HTMLInput
							:id="`SL${i}`"
							v-model:value="student.second_lastname"
						/>
					</td>
					<td>
						<HTMLInput :id="`R${i}`" v-model:value="student.rut" />
					</td>
					<td>
						<HTMLInput
							:id="`RN${i}`"
							v-model:value="student.registration_number"
						/>
					</td>
					<td>
						<HTMLSelect id="course" v-model:value="student.course">
							<option value="">Sin curso</option>
							<option
								v-for="section in sections"
								:key="section._id"
								:value="section._id"
							>
								{{ section.course.course }}
								{{ section.section }}
							</option>
						</HTMLSelect>
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
