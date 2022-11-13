<script setup lang="ts">
// Types
import type { Semester } from '~~/models/semester/semester.model'
import type { Observation } from '~~/models/booklife/observation.model'
import { ErrorFetch } from '~~/common/fetchModule';
import { UserTypesKeys } from '~~/models/user/user.model';
// Utils
import { formatUserType, formatDate } from '@@/utils/format'
// Props
const { idStudent } = defineProps<{
    idStudent?: string
}>()
// Nuxt app
const {
    $fetchModule,
    $semesterService,
    $booklifeService,
} = useNuxtApp()
// Composable
const spinner = useSpinner()
// Stores
const auth = useAuthStore()

const semesters = ref<Array<Semester> | null>(null)
try {
    semesters.value = await $semesterService.getSemesters()
} catch (err) {
    const _err = $fetchModule.handleError(err)
    throw createError({
        ..._err,
        fatal: true,
    })
}

// Selected
const semester = ref<Semester | null>(null)
// Data
const observations = ref<Array<Observation> | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(() => getSemesterObservations(0))

async function getSemesterObservations(index: number) {
    if (!semesters.value) return
    // Set
    semester.value = semesters.value[index]
    try {
        observations.value = await $booklifeService.getSemesterObservations(
            semester.value._id,
            idStudent,
        )
    } catch (err) {
        error.value = $fetchModule.handleError(err)
    }
}

// Form
const observationForm = reactive({
    observation: '',
    type: '',
})
// Upload/Update observations
function defaultObservationForm() {
    observationForm.observation = ''
    observationForm.type = ''
}
// Modal
const modalAdd = ref(false)
const toggleModalAdd = () => {
    modalAdd.value = !modalAdd.value
    defaultObservationForm()
}

async function uploadObservation() {
    const uploadedObservation = await $booklifeService.uploadObservation(
        observationForm,
        idStudent ?? '',
        semester.value?._id ?? '',
    )
    if (uploadedObservation && observations.value) {
        defaultObservationForm()
        observations.value = [uploadedObservation, ...observations.value]
    }
}

async function deleteObservation(id: string) {
    const isDeleted = await $booklifeService.deleteObservation(id)
    if (isDeleted && observations.value)
        observations.value = observations.value.filter((observation) => {
            if (observation._id !== id) return observation
        })
}
</script>

<template>
    <section class="Booklife">
        <aside class="Semesters">
            <ul>
                <li v-for="(semester, i) in semesters" >
                    <HTMLButtonText :click="() => getSemesterObservations(i)">
                        {{ semester.year }} {{ semester.semester }}°
                    </HTMLButtonText>
                </li>
                <li v-if="semesters && semesters.length === 0">
                    Sin semestres...
                </li>
            </ul>
        </aside>
        <section class="Observations" v-if="semester">
            <h3>Observaciones {{ semester.year }} - {{ semester.semester }}°</h3>
            <header>
                <HTMLButtonText :click="toggleModalAdd">
                    <i class="fa-solid fa-plus" /> Agregar observaci&oacute;n
                </HTMLButtonText>
            </header>
            <article v-for="observation in observations" class="Observation">
                <aside v-if="(
                    auth.getID === observation.author._id ||
                    auth.userTypeIs(UserTypesKeys.DIRECTOR, UserTypesKeys.DIRECTIVE)
                )">
                    <HTMLButtonIcon
                        :click="() => deleteObservation(observation._id)"
                        classItem="fa-solid fa-xmark"
                    />
                </aside>
                <small>
                    Observaci&oacute;n
                    {{ observation.type ? 'Positiva' : 'Negativa' }}
                </small>
                <HTMLTextArea
                    v-if="auth.getID === observation.author._id"
                    :keydown="() => $booklifeService.updateObservation(observation.observation, observation._id)"
                    v-model:value="observation.observation"
                />
                <pre v-else>{{ observation.observation }}</pre>
                <footer>
                    <small>
                        Anotado por
                        <span>
                            {{ formatUserType(observation.author.user_type) }}
                            {{ observation.author.name }}
                            {{ observation.author.first_lastname }}
                        </span>
                    </small>
                    <small>{{ formatDate(observation.date) }}</small>
                </footer>
            </article>
            <span v-if="observations && observations.length === 0">
                No hay observaciones en este periodo
            </span>

            <SpinnerGet />
            <Error v-if="error" :err="error" />
        </section>

        <!-- Modals -->
        <Modal v-model:opened="modalAdd">
            <template #title>
                <h2>Agregar observaci&oacute;n</h2>
            </template>
            <HTMLForm :form="uploadObservation">
                <label for="observation">Observaci&oacute;n</label>
                <HTMLTextArea v-model:value="observationForm.observation" />
                <label for="type">Tipo</label>
                <HTMLSelect v-model:value="observationForm.type" id="type">
                    <option value="">Seleccione una opci&oacute;n</option>
                    <option value="true">Positiva</option>
                    <option value="false">Negativa</option>
                </HTMLSelect>
                <HTMLButton type="submit">
                    Subir observaci&oacute;n
                </HTMLButton>
            </HTMLForm>
        </Modal>
    </section>
</template>

<style scoped lang="scss">
	.Booklife {
		display: grid;
		grid-template-columns: 1fr 4fr;
		gap: 20px;
	}

	.Semesters {
		border: 2px solid var(--color-light);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 5px;
		border-radius: 8px;
	}

	ul {
		list-style: none;
	}

    .Observations {
        box-sizing: border-box;
    }

	.Observations header {
		width: fit-content;
	}

	.Observations header i {
		color: var(--color-main);
	}

	.Observation {
		border-bottom: 2px solid var(--color-light);
		padding: 10px;
		position: relative;
	}

	.Observation aside {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.Observation pre {
		margin-top: 8px;
	}

	.Observation footer {
		margin-top: 15px;
		display: flex;
		justify-content: space-between;
	}

	.Observation footer span {
		color: var(--color-main);
	}

    @media (max-width: 767.98px) {
        .Booklife {
            margin: 10px;
            gap: 10px;
            padding: 0;
        }
    }

    @media (max-width: 575.98px) {
        .Booklife {
            margin: 0;
            gap: 8px;
        }

        h3 {
            font-size: 1rem;
        }

        .Semesters {
            padding: 0px;
        }

        span {
            font-size: 0.8rem;
        }

        footer small:last-child {
            text-align: right;
        }

        small {
            font-size: 0.75rem;
            span {
                font-size: 0.75rem;
            }
        }
    }
</style>
