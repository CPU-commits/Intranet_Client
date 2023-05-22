<script setup lang="ts">
// Types
import type { Work } from '~~/models/classroom/work.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Props
const props = defineProps<{
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
	const deleted = await $workService.deleteWork(props.work._id)
	if (deleted) emits('delete')
}
</script>

<template>
	<article class="Work">
		<aside v-if="dateIsBefore(new Date(), work.date_limit)" class="Topleft">
			<template v-if="auth.userTypeIs(UserTypesKeys.TEACHER)">
				<HTMLButtonIcon
					:click="() => (open = !open)"
					class-item="fa-solid fa-ellipsis-vertical"
				/>
				<div
					class="Work__config"
					:class="open ? 'Work__config--open' : ''"
				>
					<NuxtLink :to="`trabajos/editar/${work._id}`">
						<i class="fa-solid fa-pen-to-square" /> Editar
					</NuxtLink>
					<button
						@click="
							() => {
								modalDelete = true
								open = false
							}
						"
					>
						<i class="fa-solid fa-trash-can" /> Eliminar
					</button>
				</div>
			</template>
		</aside>
		<NuxtLink :to="`trabajos/${work._id}`">
			<header>
				<h3>
					<i
						v-if="work.type === 'form'"
						class="fa-solid fa-clipboard"
					></i>
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
				<small v-if="work.is_revised" class="Revised">
					<i class="fa-solid fa-circle-check" />
					Trabajo revisado
				</small>
				<p v-if="dateIsBefore(new Date(), work.date_start)">
					<i
						title="Fecha apertura trabajo"
						class="fa-solid fa-door-open"
					/>
					{{ formatDate(work.date_start) }}
				</p>
				<p v-if="!work.is_revised">
					<i
						title="Fecha cierre trabajo"
						class="fa-solid fa-door-closed"
					/>
					{{ formatDate(work.date_limit) }}
				</p>
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
				<span
					>¿Est&aacute;s seguro de querer eliminar este trabajo?</span
				>
				<div class="Buttons">
					<HTMLButtonText
						color="var(--color-danger)"
						:click="deleteWork"
					>
						S&iacute;, eliminar trabajo
					</HTMLButtonText>
					<HTMLButtonText
						color="var(--color-dark)"
						:click="() => (modalDelete = false)"
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

.dark-mode .Work__config {
	background-color: var(--color-main-dark-contrast);
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

footer small:last-child {
	text-align: right;
}

@media (max-width: 767.98px) {
	.Work {
		padding: 10px;
	}

	h3 {
		font-size: 1.1rem;
	}

	small {
		font-size: 0.75rem;
	}

	p {
		font-size: 0.9rem;
	}
}

@media (max-width: 575.98px) {
	.Work {
		padding: 8px;
	}

	h3 {
		font-size: 0.95rem;
	}

	small {
		font-size: 0.65rem;
	}

	p {
		font-size: 0.75rem;
	}

	.Topleft {
		top: 0;
		right: -5px;
	}
}
</style>
