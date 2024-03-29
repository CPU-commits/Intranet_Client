<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import type { ClassroomModule } from '~~/models/classroom/modules.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Utils
import onScroll from '~~/utils/onScroll'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Historial - Aula Virtual - ${schoolName} - Intranet`
	: 'Historial - Aula Virtual - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE],
	scrollToTop: true,
})
// Nuxtapp
const { $moduleService, $fetchModule } = useNuxtApp()

// Data
const modules = ref<Array<ClassroomModule> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	const dataFetch = await getModules(true)
	// Onscroll
	if (dataFetch !== undefined)
		onScroll({
			total: dataFetch.total,
			max: 20,
			async fx(n) {
				const dataFetch = await getModules(false, n)
				if (dataFetch !== undefined) return n + 20
				return n
			},
		})
})

async function getModules(total = false, skip = 0) {
	try {
		const dataFetch = await $moduleService.getModulesHistory(total, skip)
		if (total || !modules.value) modules.value = dataFetch.modules
		else modules.value.push(...dataFetch.modules)

		return dataFetch
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
}
</script>

<template>
	<section class="Classroom">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<ClassMenu />
		<section class="Classroom__modules">
			<!-- eslint-disable vue/no-use-v-if-with-v-for -->
			<!-- eslint-disable vue/attributes-order -->
			<ClassModule
				v-if="modules"
				v-for="_module in modules"
				:key="_module._id"
				:is-history="true"
				:module-data="_module"
			/>
			<span v-if="modules && modules.length === 0">
				Sin m&oacute;dulos en historial
			</span>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</section>
	</section>
</template>

<style scoped>
.Classroom {
	padding: 20px;
	width: 100%;
}

.Classroom__modules {
	padding: 20px;
	display: grid;
	grid-template-columns: repeat(auto-fill, 220px);
	gap: 15px;
}

@media (max-width: 767.98px) {
	.Classroom {
		padding: 15px;
	}

	.Classroom__modules {
		justify-content: center;
	}
}

@media (max-width: 575.98px) {
	.Classroom {
		padding: 10px;
	}
}
</style>
