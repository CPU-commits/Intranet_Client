<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import type { UserForm } from '~~/models/form/form.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { timeAgo } from '~~/utils/format';
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.TEACHER,
    ],
})
// Nuxtapp
const {
    $fetchModule,
    $formService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()

// Data
const forms = ref<Array<UserForm> | null>(null)
const all = ref(false)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        forms.value = await $formService.getForms()
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
})
</script>

<template>
    <section class="Forms">
        <ClassMenu />
        <br />
        <h2><i class="fa-solid fa-clipboard" /> Formularios</h2>
        <section class="Forms__yours">
            <h3>Tus formularios</h3>
            <template v-if="forms">
                <section class="UserForms">
                    <template v-for="(form, i) in forms" :key="i">
                        <NuxtLink
                            v-if="(i > 6 && all) || i <= 6"
                            :href="`/aula_virtual/formularios/${form._id}`"
                            class="Form"
                        >
                            <h4>{{ form.title }}</h4>
                            <span>
                                Tipo:
                                {{ form.has_points ? 'Con puntaje' : 'Sin puntaje' }}
                            </span>
                            <small>{{ timeAgo(form.upload_date) }}</small>
                        </NuxtLink>
                    </template>
                </section>
                <span v-if="forms.length === 0">No hay formularios...</span>
                <HTMLButtonText v-if="forms.length > 6" :click="() => (all = !all)">
                    Ver todos
                </HTMLButtonText>
            </template>
            
            <SpinnerGet v-if="spinner" />
            <Error v-if="error" :err="error" />
        </section>
        <a href="/aula_virtual/formularios/nuevo"
            ><i class="fa-solid fa-feather-pointed" /> Crear un nuevo formulario</a
        >
    </section>
</template>

<style scoped>
	.Forms {
		margin: 20px;
		background-color: white;
		padding: 20px;
		box-shadow: var(--box-shadow);
		border-radius: 10px;
        width: 100%;
	}

	.Forms__yours {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.UserForms {
		margin: 10px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 20px;
	}

	.Form {
		border: 2px solid var(--color-light);
		padding: 15px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		text-decoration: none;
		min-width: 200px;
		align-items: center;
	}

	h4 {
		transition: all 0.4s ease;
		font-size: 1.1rem;
	}

	.Form:hover h4 {
		color: var(--color-main);
	}

	.Form span {
		margin-top: 10px;
		font-size: 0.9rem;
	}

	.Form small {
		font-size: 0.75rem;
	}

	i {
		color: var(--color-main);
	}
</style>
