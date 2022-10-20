<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import { Work } from '~~/models/classroom/work.model';
import { UserTypesKeys } from '~~/models/user/user.model';
import { formatDate } from '~~/utils/format';
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.STUDENT,
        UserTypesKeys.STUDENT_DIRECTIVE,
    ],
})
// Nuxtapp
const { $fetchModule, $workService } = useNuxtApp()
// Composable
const spinner = useSpinner()
// Data
const works = ref<Array<Work & { status: number }> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        works.value = await $workService.getModulesWork()
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
})

function stringStatus(status: number) {
    if (status === 0) return 'Sin abrir'
    if (status === 1) return 'Resolviendose'
    if (status === 2) return 'Entregado y finalizado'
}
</script>

<template>
    <section class="Classroom">
        <ClassMenu />
        <section class="Classroom__works">
            <NuxtLink
                v-if="works"
                v-for="work in works"
                :key="work._id"
                :to="`/aula_virtual/clase/${work.module}/trabajos/${work._id}`"
            >
                <article class="Work">
                    <header>
                        <h3>
                            <i v-if="work.type === 'form'" class="fa-solid fa-clipboard" />
                            <i v-else class="fa-solid fa-file-arrow-up" />
                            {{ work.title }}
                            <i
                                v-if="work.is_qualified"
                                title="Calificado"
                                style="color:var(--color-main)"
                                class="fa-solid fa-certificate"
                            />
                        </h3>
                    </header>
                    <p>Desde: {{ formatDate(work.date_start) }}</p>
                    <p>Hasta: {{ formatDate(work.date_limit) }}</p>
                    <footer>
                        <small>Subido: {{ formatDate(work.date_upload) }}</small>
                        <small>
                            Estado
                            <span class="Mark">
                                {{ stringStatus(work.status) }}
                            </span>
                        </small>
                    </footer>
                </article>
            </NuxtLink>
            <span v-if="works && works.length === 0">
                <i class="fa-solid fa-house-flag" /> Sin trabajos pendientes...
            </span>

            <SpinnerGet v-if="spinner" />
            <Error v-if="error" :err="error" />
        </section>
    </section>
</template>

<style scoped>
	.Classroom {
		padding: 20px;
        width: 100%;
	}

	.Classroom__works {
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
	}

	a {
		width: 100%;
		text-decoration: none;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	h3 {
		transition: all 0.4s;
	}

	.Work {
		width: 100%;
		display: flex;
		flex-direction: column;
		background-color: white;
		box-shadow: var(--box-shadow);
		border-radius: 10px;
		padding: 20px;
	}

	.Work footer {
		display: flex;
		justify-content: space-between;
	}

	.Mark {
		color: var(--color-main);
		font-weight: bold;
	}
</style>
