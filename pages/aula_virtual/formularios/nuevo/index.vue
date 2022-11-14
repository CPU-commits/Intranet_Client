<script setup lang="ts">
// Types
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
    ? `Nuevo Formulario - Aula Virtual - ${schoolName} - Intranet`
    : 'Nuevo Formulario - Aula Virtual - Intranet'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [
        UserTypesKeys.TEACHER,
    ],
})
// Stores
const buildForm = useBuildFormStore()

onBeforeUnmount(() => {
	buildForm.$reset()
})
</script>

<template>
    <section class="Forms">
        <!-- Head -->
        <Head>
            <Title>{{ title }}</Title>
        </Head>
        <!-- Body -->
        <input v-model="buildForm.form.title" type="text" placeholder="Titulo" />
        <HTMLForm :form="buildForm.uploadForm">
            <label for="score">Puntaje (Preguntas)</label>
            <HTMLSelect v-model:value="buildForm.form.has_points" id="score">
                <option value="">Seleccionar tipo de puntaje</option>
                <option value="true">Con puntaje</option>
                <option value="false">Sin puntaje</option>
            </HTMLSelect>
            <h3><i class="fa-solid fa-cube" /> Items</h3>
            <section class="Forms__items">
                <ClassFormsItem
                    v-for="(item, i) in buildForm.getItems"
                    :key="i"
                    :number="i"
                    :item="item"
                />
                <span v-if="buildForm.getItems.length === 0">
                    Sin items
                </span>
                <HTMLButtonIcon
                    title="Nuevo item"
                    :click="buildForm.newItem"
                    classItem="fa-solid fa-plus"
                />
            </section>
            <ClassFormsQuestion
                v-if="buildForm.getItems.length > 0"
                :item="buildForm.getCheckedItem"
            />
            <HTMLButton type="submit">Subir formulario</HTMLButton>
        </HTMLForm>
    </section>
</template>

<style scoped lang="scss">
	.Forms {
		margin: 20px;
		background-color: white;
		padding: 20px;
        width: 100%;
		box-shadow: var(--box-shadow);
		border-radius: 10px;
		margin-bottom: 95vh;
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
