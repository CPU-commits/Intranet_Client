<script setup lang="ts">
// Types
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(
	schoolName
		? `Editar formulario - ${schoolName} - Intranet`
		: 'Editar formulario - Intranet',
)
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.TEACHER],
})
// Nuxtapp
const { $fetchModule } = useNuxtApp()
// Stores
const buildForm = useBuildFormStore()
// Router
const router = useRouter()
const route = useRoute()

const idForm = route.params.idForm
if (typeof idForm !== 'string')
	throw createError({
		message: '[idForm] must be a string',
		statusCode: 400,
		fatal: true,
	})
// Modal
const modal = ref(false)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
	try {
		await buildForm.initForm(idForm)
	} catch (err) {
		error.value = $fetchModule.handleError(err)
	}
})

onBeforeUnmount(() => {
	buildForm.$reset()
})

async function updateForm() {
	const updated = await buildForm.updateForm(idForm as string)
	if (updated) router.push('/aula_virtual/formularios')
}

async function deleteForm() {
	const deleted = await buildForm.deleteForm(idForm as string)
	if (deleted) router.push('/aula_virtual/formularios')
}
</script>

<template>
	<section class="Forms">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<input
			v-model="buildForm.form.title"
			type="text"
			placeholder="Titulo"
		/>
		<HTMLForm :form="updateForm">
			<label for="score">Puntaje (Preguntas)</label>
			<HTMLSelect id="score" v-model:value="buildForm.form.has_points">
				<option value="">Seleccionar tipo de puntaje</option>
				<option value="true">Con puntaje</option>
				<option value="false">Sin puntaje</option>
			</HTMLSelect>
			<h3><i class="fa-solid fa-cube" /> Items</h3>
			<section class="Forms__items">
				<ClassFormsItem
					v-for="(item, i) in buildForm.getItems"
					:key="i"
					:item="item"
					:number="i"
				/>
				<span v-if="buildForm.getItems.length === 0"> Sin items </span>
				<HTMLButtonIcon
					title="Nuevo item"
					:click="buildForm.newItem"
					class-item="fa-solid fa-plus"
				/>
			</section>
			<ClassFormsQuestion
				v-if="
					buildForm.getItems.length > 0 &&
					buildForm.checked !== undefined
				"
				:item="buildForm.getCheckedItem"
			/>
			<HTMLButton type="submit"> Actualizar formulario </HTMLButton>
			<div>
				<HTMLButtonIcon
					color="var(--color-danger)"
					hover="var(--color-danger)"
					class-item="fa-solid fa-trash-can"
					title="Eliminar formulario"
					:click="() => (modal = true)"
				/>
			</div>
		</HTMLForm>

		<SpinnerGet />
		<Error v-if="error" :err="error" />

		<!-- Modals -->
		<Modal v-model:opened="modal">
			<template #title>
				<h2>Eliminar formulario</h2>
			</template>
			<span>¿Est&aacute; seguro de querer eliminar el formulario?</span>
			<div class="Container">
				<HTMLButtonText
					color="var(--color-dark)"
					:click="() => (modal = false)"
				>
					No, no eliminar formulario
				</HTMLButtonText>
				<HTMLButtonText color="var(--color-danger)" :click="deleteForm">
					S&iacute;, eliminar formulario
				</HTMLButtonText>
			</div>
		</Modal>
	</section>
</template>

<style scoped lang="scss">
.Forms {
	margin: 20px;
	background-color: white;
	padding: 20px;
	box-shadow: var(--box-shadow);
	border-radius: 10px;
	margin-bottom: 95vh;
	width: 100%;
}

.Forms input:first-child {
	border: none;
	margin-bottom: 20px;
	font-size: 1.6rem;
	font-family: 'Karla', sans-serif;
}

.Forms input:first-child:focus {
	outline: none;
}

.Forms__items {
	display: flex;
	flex-direction: column;
	padding: 10px;
	gap: 20px;
	border: 2px solid var(--color-light);
}

span {
	text-align: center;
	margin-bottom: 20px;
}

.Container {
	display: flex;
}

@media (max-width: 767.98px) {
	.Forms__items {
		padding: 5px;
	}
}

@media (max-width: 575.98px) {
	.Forms {
		margin: 10px;
		padding: 10px;
		input:first-child {
			font-size: 1.4rem;
		}
	}

	h3 {
		font-size: 1rem;
	}

	span {
		font-size: 0.85rem;
	}
}
</style>
