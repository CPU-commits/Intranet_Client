<script setup lang="ts">
import { UserTypesKeys } from '~~/models/user/user.model';

// Nuxtapp
const {
    $gradesService,
    $filesService,
    $fetchModule,
} = useNuxtApp()
// Stores
const toasts = useToastsStore()
const auth = useAuthStore()
// Router
const route = useRoute()

// Path
const path = route.path
const base = '/aula_virtual'

async function downloadGrades() {
    try {
        const url = await $gradesService.downloadGrades()
        $filesService.downloadFileUrl(url)
    } catch (err) {
        const _err = $fetchModule.handleError(err)
        toasts.addToast({
            message: _err.message,
            type: 'error',
        })
    }
}
</script>

<template>
    <nav class="Classroom__menu">
        <NuxtLink :class="path === base ? 'Selected' : ''" to="/aula_virtual">
            <i class="fa-solid fa-chalkboard" />
        </NuxtLink>
        <NuxtLink
            v-if="auth.userTypeIs(UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE)"
            :class="path === `${base}/tareas` ? 'Selected' : ''"
            to="/aula_virtual/tareas"
        >
            <i class="fa-solid fa-thumbtack" />
        </NuxtLink>
        <HTMLButtonIcon
            v-if="auth.userTypeIs(UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE)"
            title="Exportar a PDF Calificaciones"
            classItem="fa-solid fa-marker"
            :click="downloadGrades"
        />
        <NuxtLink
            v-if="auth.userTypeIs(UserTypesKeys.STUDENT, UserTypesKeys.STUDENT_DIRECTIVE)"
            :class="path === `${base}/historial` ? 'Selected' : ''"
            to="/aula_virtual/historial"
        >
            <i class="fa-solid fa-clock-rotate-left" />
        </NuxtLink>
        <NuxtLink
            v-if="auth.userTypeIs(UserTypesKeys.TEACHER)"
            :class="path === `${base}/formularios` ? 'Selected' : ''"
            to="/aula_virtual/formularios"
        > 
            <i class="fa-solid fa-clipboard" />
        </NuxtLink>
    </nav>
</template>

<style scoped>
	.Classroom__menu {
		padding: 10px;
		display: flex;
		width: 100%;
		justify-content: space-around;
		box-sizing: border-box;
		border: 2px solid var(--color-main);
	}

	a {
		width: 100%;
		display: flex;
		justify-content: center;
		text-decoration: none;
	}

	a:hover i {
		color: var(--color-main);
	}

	i {
		transition: all 0.4s;
	}

	.Selected i {
		color: var(--color-main);
	}
</style>
