<script setup lang="ts">
// Types
import type { Voting } from '~~/models/voting/voting.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { ErrorFetch } from '~~/common/fetchModule';
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.STUDENT,
        UserTypesKeys.STUDENT_DIRECTIVE,
    ],
})
// Nuxtapp
const {
    $fetchModule,
    $studentsService,
} = useNuxtApp()
// Composable
const voting = useVoting()
const spinner = useSpinner()
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
        <SpinnerGet v-if="voting === 'waiting'" />
        <header class="Voting__content" v-else-if="myVote">
            <h2>Votaciones</h2>
            <span>Ya se realiz&oacute; un voto</span>
            <img src="/img/voting.svg" alt="Votaciones" />
        </header>
        <section v-else-if="voting === 'in progress'" class="Voting__content">
            <h2>Votaciones</h2>
            <HTMLForm v-if="votingData" :form="voteForList">
                <h3><i class="fa-solid fa-rectangle-list" /> Listas de estudiantes</h3>
                <article v-for="(list, i) in votingData.lists" class="List" :key="i">
                    <header class="List__header">
                        <span>{{ i + 1 }})</span>
                        <h3>{{ list.list_name }}</h3>
                        <input type="radio" :value="list._id" v-model="vote" />
                    </header>
                    <h4>
                        <i class="fa-solid fa-people-group" />
                        Miembros
                    </h4>
                    <HTMLTable :header="['Estudiante', 'Rol']">
                        <tr v-for="(student, i) in list.students" :key="i">
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
            
            <SpinnerGet v-if="spinner" />
        </section>
        <header v-else class="Voting__content">
            <h2>Votaciones cerradas</h2>
            <img src="/img/voting.svg" alt="Votaciones" />
        </header>

        <Error v-if="error" :err="error" />
    </section>
</template>

<style scoped>
	.Voting {
		background-color: white;
		box-shadow: var(--box-shadow);
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
</style>
