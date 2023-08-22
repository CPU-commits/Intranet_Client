<script setup lang="ts">
// Types
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
			<h2>Nueva jerarqu&iacute;a</h2>
			<br />
			<AdminHierarchy
				:action="
					(modalityForm) =>
						$collegeService.uploadHierarchy(modalityForm)
				"
			/>
		</AdminPanel>
	</NuxtLayout>
</template>

<style scoped lang="scss">
.Panel {
	overflow-x: hidden;
}
</style>
