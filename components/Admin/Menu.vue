<script setup lang="ts">
// Types

import { UserTypesKeys } from '~~/models/user/user.model'

// Router
const route = useRoute()
// Stores
const auth = useAuthStore()

// Init vars
const url = route.path
</script>

<template>
    <menu class="AdminMenu">
        <ul>
            <NuxtLink
                v-if="(
                    auth.userTypeNotIs(UserTypesKeys.LIBRARIAN) &&
                    auth.userTypeIs(UserTypesKeys.DIRECTOR)
                )"
                class="NuxtLink"
                to="/admin/colegio"
            >
                <li :class="url === '/admin/colegio' ? 'Selected' : ''">
                    <i class="fa-solid fa-building-columns" /> Colegio
                </li>
            </NuxtLink>
            <NuxtLink
                v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
                class="NuxtLink"
                to="/admin/estudiantes"
            >
                <li :class="url.startsWith('/admin/estudiantes') ? 'Selected' : ''">
					<i class="fa-solid fa-graduation-cap" /> Estudiantes
				</li>
            </NuxtLink>
            <NuxtLink
                v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
                class="NuxtLink"
                to="/admin/profesores"
            >
                <li :class="url.startsWith('/admin/profesores') ? 'Selected' : ''">
					<i class="fa-solid fa-chalkboard-user" /> Profesores
				</li>
            </NuxtLink>
            <NuxtLink
                v-if="(
                    auth.userTypeNotIs(UserTypesKeys.LIBRARIAN) &&
                    auth.userTypeIs(UserTypesKeys.DIRECTOR)
                )"
                class="NuxtLink"
                to="/admin/directivos"
            >
                <li :class="url.startsWith('/admin/directivos') ? 'Selected' : ''">
					<i class="fa-solid fa-user-tie" /> Directivos
				</li>
            </NuxtLink>
            <NuxtLink
                v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
                class="NuxtLink"
                to="/admin/cursos"
            >
                <li :class="(
                    url === '/admin/cursos' ||
                    url.startsWith('/admin/secciones')
                ) ? 'Selected' : ''">
					<i class="fa-solid fa-layer-group" /> Cursos
				</li>
            </NuxtLink>
            <NuxtLink
                v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
                class="NuxtLink"
                to="/admin/materias"
            >
                <li :class="url.startsWith('/admin/materias') ? 'Selected' : ''">
					<i class="fa-solid fa-book-bookmark" /> Materias
				</li>
            </NuxtLink>
            <NuxtLink
                v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
                class="NuxtLink"
                to="/admin/semestres"
            >
                <li :class="url.startsWith('/admin/semestres') ? 'Selected' : ''">
					<i class="fa-solid fa-calendar-days" /> Semestres
				</li>
            </NuxtLink>
            <NuxtLink
                v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
                class="NuxtLink"
                to="/admin/aula_virtual"
            >
                <li :class="url.startsWith('/admin/aula_virtual') ? 'Selected' : ''">
					<i class="fa-solid fa-chalkboard" /> Aula Virtual
				</li>
            </NuxtLink>
            <NuxtLink class="NuxtLink" to="/admin/biblioteca">
                <li :class="url.startsWith('/admin/biblioteca') ? 'Selected' : ''">
					<i class="fa-solid fa-book-bookmark" /> Biblioteca
				</li>
            </NuxtLink>
            <NuxtLink
                v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
                class="NuxtLink"
                to="/admin/archivado"
            >
                <li :class="url.startsWith('/admin/archivado') ? 'Selected' : ''">
					<i class="fa-solid fa-box-archive" /> Archivado
				</li>
            </NuxtLink>
            <NuxtLink
                v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
                class="NuxtLink"
                to="/admin/historico"
            >
                <li :class="url.startsWith('/admin/historico') ? 'Selected' : ''">
					<i class="fa-solid fa-clock-rotate-left" /> Historico
				</li>
            </NuxtLink>
        </ul>
    </menu>
</template>

<style scoped>
	.AdminMenu {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.AdminMenu ul {
		list-style: none;
		width: max-content;
		padding: 0px 10px;
	}

	li {
		padding: 15px 20px;
		transition: all 0.4s ease;
		z-index: 9;
	}

	i {
		transition: all 0.4s ease;
	}

	li:hover,
	li:hover i {
		color: var(--color-main);
	}

	.NuxtLink {
		color: white;
		text-decoration: none;
	}

	.Selected,
	.Selected i {
		color: var(--color-main);
	}

	.Selected {
		border-left: 2px solid var(--color-main);
	}
</style>
