<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule'
import type { Directives } from '~~/models/user/directive.model'
import type { User } from '~~/models/user/user.model'
import { UserTypesKeys } from '~~/models/user/user.model'
// Guard
definePageMeta({
    middleware: 'role',
    roles: [ UserTypesKeys.DIRECTOR ],
})
// Nuxt app
const {
    $fetchModule,
    $directivesService,
} = useNuxtApp()
// Compostable
const spinner = useSpinner()

//Search
const search = ref('')
// Modal
const modal = ref(false)
const modalEdit = ref(false)
const modalStatus = ref(false)
const toggleModalStatus = () => {
    modalStatus.value = !modalStatus.value
    modalEdit.value = false
}
// Form
const formDirective = reactive({
    name: '',
    first_lastname: '',
    second_lastname: '',
    rut: '',
})
// Change status
const why = ref('')
// Data
const directives = ref<Directives | null>(null)
const directiveEdit = ref<User | null>(null)
const directivePosition = ref(0)

const error = ref<ErrorFetch | null>(null)
// Provide
const total = ref(0)
provide('total', total)
onMounted(() => {getDirectives(true, 0)})

async function getDirectives(getTotal = false, skip?: number, search?: string) {
    try {
        // Clean error
        error.value = null
        // Get data
        const dataFetch = await $directivesService.getDirectives(
            getTotal,
            skip,
            search,
        )
        if (getTotal || !directives.value) {
            directives.value = dataFetch
            total.value = dataFetch.total ?? 0
        } else directives.value.users = dataFetch.users
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
}
// Upload directive
function initForm(newDirective: User) {
    modal.value = false
    formDirective.first_lastname = ''
    formDirective.name = ''
    formDirective.rut = ''
    formDirective.second_lastname = ''

    directives.value?.users.push(newDirective)
}

async function uploadDirective() {
    const dataFetch = await $directivesService.uploadDirective(formDirective as User)
    if (dataFetch !== undefined)
        initForm(dataFetch)
}

async function editDirective() {
    const index = directivePosition.value
    const dataFetch = await $directivesService.editDirective(
        directiveEdit.value as User,
        (directiveEdit.value as User)._id,
    )
    if (dataFetch && directives.value) {
        modalEdit.value = false
        directives.value.users[index] = directiveEdit.value as User
    }
}
// Change status
function initStatusForm() {
    why.value = ''
    toggleModalStatus()
}

async function changeStatus() {
    const index = directivePosition.value
    const dataFetch = await $directivesService.changeStatus(
        why.value,
        (directiveEdit.value as User)._id
    )
    if (dataFetch && directives.value) {
        initStatusForm()
        directives.value.users[index].status =
            directives.value.users[index].status === 1 ? 0 : 1
    }
}
</script>

<template>
    <NuxtLayout name="admin">
        <AdminPanel>
            <template #nav>
                <Icons>
                    <HTMLButtonIcon
                        title="Agregar directivo"
                        :click="() => modal = true"
                        classItem="fa-solid fa-user-plus"
                    />
                    <HTMLAIcon
                        title="Agregar directivos"
                        href="/admin/directivos/masivo"
                        classItem="fa-solid fa-user-group"
                    />
                </Icons>
            </template>
            <h2>Directivos</h2>
            <HTMLSearch :search="() => getDirectives(true, 0, search)" v-model:value="search" />
            <br />
            <HTMLTable
                v-if="directives"
                :header="['Nombre', 'Ap. P', 'Ap. M', 'RUT', 'Estado', '']"
                :navigate="{
                    activate: true,
                    max: 30,
                    async fn(n: number) {
                        await getDirectives(true, n, search.value)
                    },
                }"
                @memo="(value: any) => {
                    if (directives) directives.users = value
                }"
            >
                <tr v-for="(directive, i) in directives.users" :key="directive._id">
                    <td>{{ directive.name }}</td>
                    <td>{{ directive.first_lastname }}</td>
                    <td>{{ directive.second_lastname }}</td>
                    <td>{{ directive.rut }}</td>
                    <td>{{ directive.status ? 'Activo' : 'Inactivo ' }}</td>
                    <td>
                        <HTMLButtonIcon
                            :click="() => {
                                directiveEdit = Object.assign({}, directive)
                                directivePosition = i
                                
                                modalEdit = true
                            }"
                            type="button"
                            class-item="fa-solid fa-pen-to-square"
                        />
                    </td>
                </tr>
            </HTMLTable>
            <span v-if="directives && directives.users.length === 0">
                No hay directivos...
            </span>

            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </AdminPanel>

        <!-- Modals -->
        <Modal v-model:opened="modal">
            <template #title>
                <h2>Agregar directivo</h2>
            </template>
            <HTMLForm :form="uploadDirective">
                <label for="name">Nombre</label>
                <HTMLInput v-model:value="formDirective.name" id="name" />
                <label for="fln">Apellido Paterno</label>
                <HTMLInput v-model:value="formDirective.first_lastname" id="fln" />
                <label for="sln">Apellido Materno</label>
                <HTMLInput v-model:value="formDirective.second_lastname" id="sln" />
                <label for="rut">RUT</label>
                <HTMLInput v-model:value="formDirective.rut" id="rut" />
                <HTMLButton type="submit">Agregar directivo</HTMLButton>
            </HTMLForm>
        </Modal>

        <Modal v-model:opened="modalEdit">
            <template #title>
                <h2>
                    Editar {{ directives?.users[directivePosition].name }}
                    {{ directives?.users[directivePosition].first_lastname }}
                </h2>
            </template>
            <HTMLForm v-if="directiveEdit" :form="editDirective">
                <label for="nameE">Nombre</label>
                <HTMLInput v-model:value="directiveEdit.name" id="nameE" />
                <label for="flnE">Apellido Paterno</label>
                <HTMLInput v-model:value="directiveEdit.first_lastname" id="flnE" />
                <label for="slnE">Apellido Materno</label>
                <HTMLInput v-model:value="directiveEdit.second_lastname" id="slnE" />
                <label for="rutE">RUT</label>
                <HTMLInput v-model:value="directiveEdit.rut" id="rutE" />
                <HTMLButton type="submit">Editar directivo</HTMLButton>
            </HTMLForm>
            <button
                v-if="directives?.users[directivePosition].status === 1"
                @click="toggleModalStatus"
                class="Form__button Down"
                type="button"
            >
                <i class="fa-solid fa-angles-down" /> Dar de baja directivo
            </button>
            <button
                v-else
                @click="toggleModalStatus"
                class="Form__button Up"
                type="button"
            >
                <i class="fa-solid fa-angles-up" /> Reintegrar directivo
            </button>
        </Modal>

        <Modal v-model:opened="modalStatus" :fn="() => modalEdit = true">
            <template #title>
                <h2>
                    Cambiar estado directivo - {{ directives?.users[directivePosition].status === 1
                        ? 'Dar de baja'
                        : 'Reintegrar' }}
                </h2>
            </template>
            <HTMLForm :form="changeStatus">
                <label for="why">Motivo</label>
                <HTMLTextArea v-model:value="why" />
                <HTMLButton type="submit">Cambiar estado</HTMLButton>
            </HTMLForm>
        </Modal>
    </NuxtLayout>
</template>

<style lang="scss" scoped>
	h2 {
		margin-bottom: 15px;
	}

	i {
		color: white;
	}

	.Form__button {
		position: absolute;
		top: 75px;
		background: transparent;
		border: none;
	}

	.Down {
		color: var(--color-danger);
		i {
			color: var(--color-danger);
		}
	}

	.Up {
		color: var(--color-main);
		i {
			color: var(--color-main);
		}
	}

    @media (max-width: 575.98px) {
        .Form__button {
            top: 45px;
        }
    }
</style>
