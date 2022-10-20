<script setup lang="ts">
// Types
import type { Work } from '~~/models/classroom/work.model'
import { UserTypesKeys } from '~~/models/user/user.model';
// Utils
import { dateIsBefore } from '~~/utils/dates'
import { formatDate, timeAgo } from '~~/utils/format';

// Props
const { work } = defineProps<{
    work: Work
}>()
// Nuxtapp
const { $workService } = useNuxtApp()
// Stores
const auth = useAuthStore()

// Emits
const emits = defineEmits<{
    (e: 'delete', _: void): void
}>()

const open = ref(false)
// Modal
const modalDelete = ref(false)

async function deleteWork() {
	modalDelete.value = false
    const deleted = await $workService.deleteWork(work._id)
    if (deleted) emits('delete')
}
</script>

<template>
    <article class="Work">
        <aside v-if="dateIsBefore(new Date(), work.date_limit)" class="Topleft">
            <template v-if="auth.userTypeIs(UserTypesKeys.TEACHER)">
                <HTMLButtonIcon
                    :click="() => (open = !open)"
                    classItem="fa-solid fa-ellipsis-vertical"
                />
                <div class="Work__config" :class="open ? 'Work__config--open' : ''">
                    <NuxtLink :to="`trabajos/editar/${work._id}`">
                        <i class="fa-solid fa-pen-to-square" /> Editar
                    </NuxtLink>
                    <button
                        @click="() => {
                            modalDelete = true
                            open = false
                        }"
                    >
                        <i class="fa-solid fa-trash-can" /> Eliminar
                    </button>
                </div>
            </template>
        </aside>
        <NuxtLink :to="`trabajos/${work._id}`">
            <header>
                <h3>
                    <i v-if="work.type === 'form'" class="fa-solid fa-clipboard"></i>
                    <i v-else class="fa-solid fa-file-arrow-up"></i>
                    {{ work.title }}
                </h3>
                <div v-if="work.is_qualified" class="Grade">
                    <small>
                        <i class="fa-solid fa-certificate" />
                        Calificado ({{ work.grade.number }}° -
                        {{ work.grade.percentage }}%)
                    </small>
                    <small v-if="work.grade.is_acumulative">
                        Calificación acumulativa
                        {{ work.grade.acumulative[0].number }}° -
                        {{ work.grade.acumulative[0].percentage }}%
                    </small>
                </div>
            </header>
            <section class="Work__body">
                <small class="Revised" v-if="work.is_revised">
                    <i class="fa-solid fa-circle-check" />
                    Trabajo revisado
                </small>
                <p v-if="dateIsBefore(new Date(), work.date_start)">
                    Fecha apertura trabajo: {{ formatDate(work.date_start) }}
                </p>
                <span>Fecha cierre trabajo: {{ formatDate(work.date_limit) }}</span>
            </section>
            <footer>
                <small>
                    Publicado por
                    <span>
                        {{ work.author.name }}
                        {{ work.author.first_lastname }}
                    </span>
                </small>
                <small>
                    {{ timeAgo(work.date_upload) }}
                    <span v-if="work.date_upload !== work.date_update">
                        (editado)
                    </span>
                </small>
            </footer>
        </NuxtLink>

        <!-- Modals -->
        <Modal v-model:opened="modalDelete">
            <template #title>
                <h2>Eliminar trabajo</h2>
            </template>
            <div class="Modal">
                <span>¿Est&aacute;s seguro de querer eliminar este trabajo?</span>
                <div class="Buttons">
                    <HTMLButtonText
                        color="var(--color-danger)" 
                        :click="deleteWork"
                    >
                        S&iacute;, eliminar trabajo
                    </HTMLButtonText>
                    <HTMLButtonText
                        color="var(--color-dark)"
                        :click="() => modalDelete = false"
                    >
                        No, no eliminar trabajo
                    </HTMLButtonText>
                </div>
            </div>
        </Modal>
    </article>
</template>

<style lang="scss" scoped>
	a {
		text-decoration: none;
	}

	a:hover h3 {
		color: var(--color-main);
	}

	.Work {
		position: relative;
		padding: 15px;
		border-bottom: 1px solid var(--color-light);
	}

	header {
		display: flex;
		justify-content: space-between;
	}

	h3 {
		transition: all 0.4s;
	}

	.Topleft {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 5px;
		position: absolute;
		right: 0;
		top: 12px;
	}

	.Work__config {
		position: absolute;
		background-color: white;
		top: 0;
		right: 10px;
		padding: 5px 10px;
		z-index: 4;
		border: 1px solid var(--color-light);
		display: none;
	}

	.Work__config--open {
		display: block;
	}

	.Work__config button,
	.Work__config a {
		padding: 3px 0;
		width: 100%;
		display: flex;
		gap: 5px;
		transition: all 0.4s;
		font-size: 0.8rem;
		text-decoration: none;
		i {
			transition: all 0.4s;
		}
	}

	.Work__config a:hover {
		color: var(--color-news);
		i {
			color: var(--color-news);
		}
	}

	.Work__config button:hover {
		color: var(--color-danger);
		i {
			color: var(--color-danger);
		}
	}

	aside button,
	aside a {
		border: none;
		background-color: transparent;
	}

	.Grade {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.Work__body {
		margin-top: 10px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	small i,
	header i {
		color: var(--color-main);
	}

	footer {
		display: flex;
		margin-top: 15px;
		justify-content: space-between;
	}

	footer small span {
		color: var(--color-main);
	}

	.Revised {
		width: 100%;
		color: var(--color-main);
		font-weight: bold;
	}

	.Modal {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.Buttons {
		display: flex;
	}
</style>
