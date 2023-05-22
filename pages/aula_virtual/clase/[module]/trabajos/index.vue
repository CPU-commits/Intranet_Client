<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Work } from '~~/models/classroom/work.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(
	schoolName
		? ` - Trabajos - ${schoolName} - Intranet`
		: ` - Trabajos - Intranet`,
)
// Guard
definePageMeta({
	middleware: 'role',
	roles: [
		UserTypesKeys.STUDENT,
		UserTypesKeys.STUDENT_DIRECTIVE,
		UserTypesKeys.TEACHER,
	],
})
// Nuxtapp
const { $fetchModule, $workService } = useNuxtApp()
// Stores
const auth = useAuthStore()
// Router
const route = useRoute()

const idModule = route.params.module
if (typeof idModule !== 'string')
	throw createError({
		message: '[module] must be a string',
		statusCode: 400,
		fatal: true,
	})

// Data
const works = ref<Array<Work> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		works.value = await $workService.getWorks(idModule)
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

function deleteWork(index: number) {
	if (works.value) works.value.splice(index, 1)
}
</script>

<template>
	<NuxtLayout name="class">
		<section class="Works">
			<!-- Head -->
			<Head>
				<Title>{{ title }}</Title>
				<Meta name="robots" content="noindex, nofollow" />
			</Head>
			<!-- Body -->
			<h2>Trabajos</h2>
			<NuxtLink
				v-if="auth.userTypeIs(UserTypesKeys.TEACHER)"
				to="trabajos/nuevo_trabajo"
			>
				<i class="fa-solid fa-plus" /> Nuevo trabajo
			</NuxtLink>

			<!-- eslint-disable vue/no-use-v-if-with-v-for -->
			<!-- eslint-disable vue/attributes-order -->
			<ClassWork
				v-if="works"
				v-for="(work, i) in works"
				:key="work._id"
				:work="work"
				@delete="() => deleteWork(i)"
			/>
			<figure v-if="works && works.length === 0" class="NoWorks">
				<img src="/img/no_works.svg" alt="Sin trabajos" />
				<figcaption>Sin trabajos a la vista...</figcaption>
			</figure>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</section>
	</NuxtLayout>
</template>

<style scoped>
.dark-mode .Works {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Works {
	box-shadow: var(--box-shadow);
}

.Works {
	background-color: white;
	margin: 20px;
	padding: 15px;
	border-radius: 10px;
}

.NoWorks {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.NoWorks img {
	height: 300px;
	width: 100%;
	margin-bottom: 30px;
}

i,
a {
	color: var(--color-main);
}

@media (max-width: 767.98px) {
	.Works {
		margin: 15px;
	}

	h2 {
		font-size: 1.4rem;
	}

	a {
		font-size: 0.9rem;
	}
}

@media (max-width: 575.98px) {
	.Works {
		margin: 10px;
		padding: 10px;
	}

	h2 {
		font-size: 1.2rem;
	}

	a {
		font-size: 0.8rem;
	}
}
</style>
