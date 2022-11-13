<script setup lang="ts">
// Types
import { ErrorFetch } from '~~/common/fetchModule';
import { AnyUser, UserTypesKeys } from '~~/models/user/user.model'
// Nuxtapp
const {
    $fetchModule,
    $userService,
} = useNuxtApp()
// Stores
const auth = useAuthStore()

// Form
const email = ref('')
// Data
const user = ref<AnyUser | null>(null)

const error = ref<ErrorFetch | null>(null)
onMounted(async () => {
    try {
        const dataFetch = await $userService.getUserData()
        user.value = dataFetch
        email.value = dataFetch?.email ?? ''
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        error.value = _err
    }
})
</script>

<template>
    <User>
        <template #title>
            <h2>Datos personales</h2>
        </template>
        <div class="Container">
            <section class="ContentData">
                <!-- Data -->
                <HTMLVerticalTable v-if="user">
                    <tr>
                        <td>Nombre</td>
                        <td>{{ user.name }}</td>
                    </tr>
                    <tr>
                        <td>Apellido P.</td>
                        <td>{{ user.first_lastname }}</td>
                    </tr>
                    <tr>
                        <td>Apellido M.</td>
                        <td>{{ user.second_lastname }}</td>
                    </tr>
                    <tr>
                        <td>RUT</td>
                        <td>{{ user.rut }}</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td class="EmailInput">
                            <HTMLInput id="email" v-model:value="email" type="email" />
                            <HTMLButtonIcon
                                :click="() => $userService.changeEmail(email)"
                                classItem="fa-solid fa-pen-to-square"
                            />
                        </td>
                    </tr>
                    <tr v-if="auth.userTypeIs(UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE)">
                        <td>Curso</td>
                        <td>
                            {{ user?.course?.course
                                ? `${user.course.course.course} ${user.course.section}`
                                : 'Sin asignar' }}
                        </td>
                    </tr>
                    <tr v-if="auth.userTypeIs(UserTypesKeys.TEACHER) && user.imparted">
                        <td>Cursos impartidos</td>
                        <td>
                            {{ user.imparted
                                .map((imparted) => {
                                    return `${imparted.course.course.course} ${imparted.course.section} ${imparted.subject.subject}`
                                })
                                .join(', ') }}
                        </td>
                    </tr>
                </HTMLVerticalTable>
                
                <SpinnerGet />
                <Error v-if="error" :err="error" />
            </section>
        </div>
    </User>
</template>

<style scoped>
	.EmailInput {
		display: flex;
		gap: 30px;
		align-items: center;
		justify-content: center;
	}

	.Container {
		display: flex;
		justify-content: center;
	}

	.ContentData {
		max-width: 1000px;
        width: 100%;
	}

    @media (max-width: 767.98px) {
        .EmailInput {
            gap: 0px;
        }
    }

    @media (max-width: 575.98px) {
        h2 {
            font-size: 1.2rem;
        }
    }
</style>
