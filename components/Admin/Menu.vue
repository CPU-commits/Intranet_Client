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
		<ClientOnly>
			<ul>
				<NuxtLink
					v-if="
						auth.userTypeNotIs(UserTypesKeys.LIBRARIAN) &&
						auth.userTypeIs(UserTypesKeys.DIRECTOR)
					"
					class="NuxtLink"
					to="/admin/colegio"
				>
					<li :class="url === '/admin/colegio' ? 'Selected' : ''">
						<i class="fa-solid fa-building-columns" />
						<span>Colegio</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/apoderados"
				>
					<li
						:class="{
							Selected: url.startsWith('/admin/apoderados'),
						}"
					>
						<i class="fa-solid fa-user"></i>
						<span>Apoderados</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/estudiantes"
				>
					<li
						:class="
							url.startsWith('/admin/estudiantes')
								? 'Selected'
								: ''
						"
					>
						<i class="fa-solid fa-graduation-cap" />
						<span>Estudiantes</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/profesores"
				>
					<li
						:class="
							url.startsWith('/admin/profesores')
								? 'Selected'
								: ''
						"
					>
						<i class="fa-solid fa-chalkboard-user" />
						<span>Profesores</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="
						auth.userTypeNotIs(UserTypesKeys.LIBRARIAN) &&
						auth.userTypeIs(UserTypesKeys.DIRECTOR)
					"
					class="NuxtLink"
					to="/admin/directivos"
				>
					<li
						:class="
							url.startsWith('/admin/directivos')
								? 'Selected'
								: ''
						"
					>
						<i class="fa-solid fa-user-tie" />
						<span>Directivos</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/cursos"
				>
					<li
						:class="
							url === '/admin/cursos' ||
							url.startsWith('/admin/secciones')
								? 'Selected'
								: ''
						"
					>
						<i class="fa-solid fa-layer-group" />
						<span>Cursos</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/materias"
				>
					<li
						:class="
							url.startsWith('/admin/materias') ? 'Selected' : ''
						"
					>
						<i class="fa-solid fa-book-bookmark" />
						<span>Materias</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/anclaje"
				>
					<li
						:class="
							url.startsWith('/admin/anclaje') ? 'Selected' : ''
						"
					>
						<i class="fa-solid fa-anchor" />
						<span>Anclaje</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/semestres"
				>
					<li
						:class="
							url.startsWith('/admin/semestres') ? 'Selected' : ''
						"
					>
						<i class="fa-solid fa-calendar-days" />
						<span>Semestres</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/aula_virtual"
				>
					<li
						:class="
							url.startsWith('/admin/aula_virtual')
								? 'Selected'
								: ''
						"
					>
						<i class="fa-solid fa-chalkboard" />
						<span>Aula Virtual</span>
					</li>
				</NuxtLink>
				<NuxtLink class="NuxtLink" to="/admin/data">
					<li :class="{ Selected: url.startsWith('/admin/data') }">
						<i class="fa-solid fa-chart-simple"></i>
						<span>Data</span>
					</li>
				</NuxtLink>
				<NuxtLink class="NuxtLink" to="/admin/biblioteca">
					<li
						:class="
							url.startsWith('/admin/biblioteca')
								? 'Selected'
								: ''
						"
					>
						<i class="fa-solid fa-book-bookmark" />
						<span>Biblioteca</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/archivado"
				>
					<li
						:class="
							url.startsWith('/admin/archivado') ? 'Selected' : ''
						"
					>
						<i class="fa-solid fa-box-archive" />
						<span>Archivado</span>
					</li>
				</NuxtLink>
				<NuxtLink
					v-if="auth.userTypeNotIs(UserTypesKeys.LIBRARIAN)"
					class="NuxtLink"
					to="/admin/historico"
				>
					<li
						:class="
							url.startsWith('/admin/historico') ? 'Selected' : ''
						"
					>
						<i class="fa-solid fa-clock-rotate-left" />
						<span>Historico</span>
					</li>
				</NuxtLink>
			</ul>
		</ClientOnly>
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
	border-left: 2px solid transparent;
	display: flex;
	align-items: center;
	gap: 5px;
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

@media (max-width: 767.98px) {
	li {
		font-size: 0.8rem;
		padding: 12px 8px;
	}
}

@media (max-width: 575.98px) {
	.AdminMenu ul {
		padding: 0;
	}

	li span {
		padding: 0;
		display: none;
	}
}
</style>
