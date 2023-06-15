<script setup lang="ts">
// Types
import { Address } from '~/models/address/address'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Colegio - Admin - ${schoolName} - Intranet`
	: 'Colegio - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR],
})
// Nuxtapp
const { $fetchModule, $collegeService } = useNuxtApp()

// Data
const college = reactive({
	direction: '',
	phone: '',
	email: '',
	address: {
		street_number_name: '',
		building_site_number: '',
		city: '',
		postal_code: '',
		country: '',
		lat: 0,
		lng: 0,
	} as Address,
})

const error = ref<ErrorFetch | null>(null)

onMounted(async () => {
	try {
		const dataFetch = await $collegeService.getCollege()
		college.direction = dataFetch.direction
		college.phone = dataFetch.phone
		college.email = dataFetch.email
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})
</script>

<template>
	<NuxtLayout name="admin">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<AdminPanel :nav="false">
			<!-- Data -->
			<h2>Colegio</h2>
			<br />
			<HTMLForm :form="() => $collegeService.uploadCollegeData(college)">
				<label for="address">Direcci&oacute;n</label>
				<HTMLAddress
					id="address"
					v-model:value="college.direction"
					v-model:address="college.address"
				/>
				<label for="phone">Telef&oacute;no</label>
				<HTMLInput id="phone" v-model:value="college.phone" />
				<label for="email">Email</label>
				<HTMLInput
					id="email"
					v-model:value="college.email"
					type="email"
				/>
				<HTMLButton type="submit"> Actualizar datos </HTMLButton>
			</HTMLForm>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>
	</NuxtLayout>
</template>
