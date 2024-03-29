<script setup lang="ts">
// Types
import type { Voting } from '~~/models/voting/voting.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { ErrorFetch } from '~~/common/fetchModule'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Votar - ${schoolName} - Intranet`
	: 'Votar - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE],
})
// Nuxtapp
const { $fetchModule, $studentsService } = useNuxtApp()
// Composable
const voting = useVoting()
// Router
const router = useRouter()

// Form
const vote = ref('')
const myVote = ref<boolean | null>(null)
// Data
const votingData = ref<Voting | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$studentsService.getVoting(),
			$studentsService.getStudentVote(),
		])
		votingData.value = dataFetch[0]
		myVote.value = dataFetch[1]
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

async function voteForList() {
	const voted = await $studentsService.voteForList(vote.value)
	if (voted) router.push('/inicio')
}
</script>

<template>
	<section class="Voting">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<SpinnerGet v-if="voting === 'waiting'" />
		<header v-else-if="myVote" class="Voting__content">
			<h2>Votaciones</h2>
			<span>Ya se realiz&oacute; un voto</span>
			<img src="/img/voting.svg" alt="Votaciones" />
		</header>
		<section v-else-if="voting === 'in progress'" class="Voting__content">
			<h2>Votaciones</h2>
			<HTMLForm v-if="votingData" :form="voteForList">
				<h3>
					<i class="fa-solid fa-rectangle-list" /> Listas de
					estudiantes
				</h3>
				<article
					v-for="(list, i) in votingData.lists"
					:key="i"
					class="List"
				>
					<header class="List__header">
						<span>{{ i + 1 }})</span>
						<h3>{{ list.list_name }}</h3>
						<input v-model="vote" type="radio" :value="list._id" />
					</header>
					<h4>
						<i class="fa-solid fa-people-group" />
						Miembros
					</h4>
					<HTMLTable :header="['Estudiante', 'Rol']">
						<tr v-for="(student, j) in list.students" :key="j">
							<td>
								{{ student._id.name }}
								{{ student._id.first_lastname }}
								{{ student._id.second_lastname }}
							</td>
							<td>
								{{ student.rol }}
							</td>
						</tr>
					</HTMLTable>
				</article>
				<HTMLButton type="submit">
					<span class="ButtonVote">
						<i class="fa-solid fa-check-to-slot" /> Votar
					</span>
				</HTMLButton>
			</HTMLForm>

			<SpinnerGet />
		</section>
		<header v-else class="Voting__content">
			<h2>Votaciones cerradas</h2>
			<img src="/img/voting.svg" alt="Votaciones" />
		</header>

		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped>
.dark-mode .Voting {
	background-color: var(--color-main-dark-contrast);
}

.light-mode .Voting {
	box-shadow: var(--box-shadow);
}

.Voting {
	background-color: white;
	margin: 30px;
	padding: 15px;
	border-radius: 10px;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 15px;
}

.Voting__content {
	width: 100%;
}

h2 {
	color: var(--color-main);
}

img {
	max-height: 300px;
}

.List {
	padding: 15px;
}

.List__header {
	display: flex;
	gap: 5px;
	align-items: center;
}

h4 {
	margin-top: 10px;
	display: flex;
	gap: 5px;
	align-items: center;
}

.ButtonVote {
	font-weight: bold;
	color: white;
}

.ButtonVote i {
	color: white;
}

@media (max-width: 767.98px) {
	h2 {
		font-size: 1.3rem;
	}

	h3 {
		font-size: 1.1rem;
	}

	h4 {
		font-size: 1rem;
	}

	.Voting {
		margin: 20px;
	}
}

@media (max-width: 575.98px) {
	h2 {
		font-size: 1.1rem;
	}

	h3 {
		font-size: 0.9rem;
	}

	h4 {
		font-size: 0.85rem;
	}

	.Voting {
		margin: 10px;
	}
}
</style>
