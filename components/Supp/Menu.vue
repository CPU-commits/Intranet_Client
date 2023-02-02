<script setup lang="ts">
// Props
defineProps<{
	menu: boolean
}>()
// Router
const route = useRoute()
// Emits
const emits = defineEmits<{
	(e: 'menuClose', menuClose: void): VoidFunction
}>()

const path = ref(route.path)
watch(
	() => route.path,
	(newValue) => {
		path.value = newValue
	},
)
</script>

<template>
	<nav class="SuppMenu" :class="{ MenuOpen: menu }">
		<HTMLButtonIcon
			:class-item="'fa-solid fa-circle-info'"
			:click="() => emits('menuClose')"
		>
			Menu
		</HTMLButtonIcon>
		<br />
		<ul>
			<li>
				<span
					><i class="fa-solid fa-bell-concierge" /> Aplicaciones o
					servicios</span
				>
				<ul class="Wrap">
					<li
						:class="{
							SelectedMenu: path.includes(
								'/soporte/app/aula_virtual',
							),
						}"
					>
						<span> Aula virtual </span>

						<ul class="Wrap">
							<li
								:class="{
									Selected:
										path === '/soporte/app/aula_virtual',
								}"
							>
								<span>
									<NuxtLink to="/soporte/app/aula_virtual">
										General
									</NuxtLink>
								</span>
							</li>
							<li
								:class="{
									Selected:
										path ===
										'/soporte/app/aula_virtual/vista',
								}"
							>
								<span>
									<NuxtLink
										to="/soporte/app/aula_virtual/vista"
									>
										Vista
									</NuxtLink>
								</span>
							</li>
							<li
								:class="{
									Selected:
										path ===
										'/soporte/app/aula_virtual/formularios',
								}"
							>
								<span>
									<NuxtLink
										to="/soporte/app/aula_virtual/formularios"
									>
										Formularios
									</NuxtLink>
								</span>
							</li>
						</ul>
					</li>
					<li :class="{ Selected: path === '/soporte/app/noticias' }">
						<span>
							<NuxtLink to="/soporte/app/noticias">
								Noticias
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected:
								path === '/soporte/app/biblioteca_virtual',
						}"
					>
						<span>
							<NuxtLink to="/soporte/app/biblioteca_virtual">
								Biblioteca virtual
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected: path === '/soporte/app/libro_vida',
						}"
					>
						<span>
							<NuxtLink to="/soporte/app/libro_vida">
								Libro de vida
							</NuxtLink>
						</span>
					</li>
				</ul>
			</li>
			<li>
				<span><i class="fa-solid fa-user" /> Usuario</span>
				<ul class="Wrap">
					<li
						:class="{
							Selected:
								path ===
								'/soporte/usuario/informacion_personal',
						}"
					>
						<span>
							<NuxtLink
								to="/soporte/usuario/informacion_personal"
							>
								Informaci&oacute;n personal
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected:
								path === '/soporte/usuario/calificaciones',
						}"
					>
						<span>
							<NuxtLink to="/soporte/usuario/calificaciones">
								Calificaciones
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected: path === '/soporte/usuario/archivos',
						}"
					>
						<span>
							<NuxtLink to="/soporte/usuario/archivos">
								Archivos
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected:
								path === '/soporte/usuario/notificaciones',
						}"
					>
						<span>
							<NuxtLink to="/soporte/usuario/notificaciones">
								Notificaciones
							</NuxtLink>
						</span>
					</li>
				</ul>
			</li>
			<li
				class="Single"
				:class="{ SelectedSingle: path === '/soporte/acceso' }"
			>
				<NuxtLink to="/soporte/acceso">
					<span
						><i class="fa-solid fa-right-to-bracket" /> Acceso</span
					>
				</NuxtLink>
			</li>
			<li>
				<span
					><i class="fa-solid fa-users" /> Creación de usuarios</span
				>
				<ul class="Wrap">
					<li
						:class="{
							Selected: path === '/soporte/usuarios/directivos',
						}"
					>
						<span>
							<NuxtLink to="/soporte/usuarios/directivos">
								Directivos
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected: path === '/soporte/usuarios/profesores',
						}"
					>
						<span>
							<NuxtLink to="/soporte/usuarios/profesores">
								Profesores
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected:
								path === '/soporte/usuarios/bibliotecarios',
						}"
					>
						<span>
							<NuxtLink to="/soporte/usuarios/bibliotecarios">
								Bibliotecarios
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected: path === '/soporte/usuarios/estudiantes',
						}"
					>
						<span>
							<NuxtLink to="/soporte/usuarios/estudiantes">
								Estudiantes
							</NuxtLink>
						</span>
					</li>
				</ul>
			</li>
			<li
				class="Single"
				:class="{ SelectedSingle: path === '/soporte/estado' }"
			>
				<NuxtLink to="/soporte/estado">
					<span
						><i class="fa-solid fa-timeline" /> Estado
						usuarios</span
					>
				</NuxtLink>
			</li>
			<li
				class="Single"
				:class="{ SelectedSingle: path === '/soporte/colegio' }"
			>
				<NuxtLink to="/soporte/colegio">
					<span><i class="fa-solid fa-school" /> Colegio</span>
				</NuxtLink>
			</li>
			<li>
				<span><i class="fa-solid fa-layer-group" /> Cursos</span>
				<ul class="Wrap">
					<li :class="{ Selected: path === '/soporte/cursos/curso' }">
						<span>
							<NuxtLink to="/soporte/cursos/curso">
								Curso
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected: path === '/soporte/cursos/secciones',
						}"
					>
						<span>
							<NuxtLink to="/soporte/cursos/secciones">
								Secciones
							</NuxtLink>
						</span>
					</li>
				</ul>
			</li>
			<li>
				<span><i class="fa-solid fa-book-bookmark" /> Materias</span>
				<ul class="Wrap">
					<li
						:class="{
							Selected: path === '/soporte/materias/materia',
						}"
					>
						<span>
							<NuxtLink to="/soporte/materias/materia">
								Materia
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected: path === '/soporte/materias/anclaje',
						}"
					>
						<span>
							<NuxtLink to="/soporte/materias/anclaje">
								Anclaje
							</NuxtLink>
						</span>
					</li>
				</ul>
			</li>
			<li>
				<span><i class="fa-solid fa-calendar-days" /> Semestres</span>
				<ul class="Wrap">
					<li
						:class="{
							Selected: path === '/soporte/semestres/semestre',
						}"
					>
						<span>
							<NuxtLink to="/soporte/semestres/semestre">
								Semestre
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected:
								path === '/soporte/semestres/cierre_semestre',
						}"
					>
						<span>
							<NuxtLink to="/soporte/semestres/cierre_semestre">
								Cierre de semestre
							</NuxtLink>
						</span>
					</li>
				</ul>
			</li>
			<li
				class="Single"
				:class="{ SelectedSingle: path === '/soporte/historico' }"
			>
				<NuxtLink to="/soporte/historico">
					<span
						><i class="fa-solid fa-clock-rotate-left" />
						Historico</span
					>
				</NuxtLink>
			</li>
			<li>
				<span
					><i class="fa-solid fa-screwdriver-wrench" />
					Administraci&oacute;n aplicaciones</span
				>
				<ul class="Wrap">
					<li
						:class="{
							SelectedMenu: path.includes(
								'/soporte/administracion/aula_virtual',
							),
						}"
					>
						<span>Aula virtual</span>

						<ul class="Wrap">
							<li
								:class="{
									Selected:
										path ===
										'/soporte/administracion/aula_virtual/modulo_panel',
								}"
							>
								<span>
									<NuxtLink
										to="/soporte/administracion/aula_virtual/modulo_panel"
									>
										M&oacute;dulo - Panel
									</NuxtLink>
								</span>
							</li>
							<li
								:class="{
									Selected:
										path ===
										'/soporte/administracion/aula_virtual/modulo_trabajos',
								}"
							>
								<span>
									<NuxtLink
										to="/soporte/administracion/aula_virtual/modulo_trabajos"
									>
										M&oacute;dulo - Trabajos
									</NuxtLink>
								</span>
							</li>
							<li
								:class="{
									Selected:
										path ===
										'/soporte/administracion/aula_virtual/modulo_calificaciones',
								}"
							>
								<span>
									<NuxtLink
										to="/soporte/administracion/aula_virtual/modulo_calificaciones"
									>
										M&oacute;dulo - Calificaciones
									</NuxtLink>
								</span>
							</li>
							<li
								:class="{
									Selected:
										path ===
										'/soporte/administracion/aula_virtual/directivas',
								}"
							>
								<span>
									<NuxtLink
										to="/soporte/administracion/aula_virtual/directivas"
									>
										Directivas de m&oacute;dulos
									</NuxtLink>
								</span>
							</li>
							<li
								:class="{
									Selected:
										path ===
										'/soporte/administracion/aula_virtual/formularios',
								}"
							>
								<span>
									<NuxtLink
										to="/soporte/administracion/aula_virtual/formularios"
									>
										Formularios
									</NuxtLink>
								</span>
							</li>
						</ul>
					</li>
					<li
						:class="{
							Selected:
								path === '/soporte/administracion/noticias',
						}"
					>
						<span>
							<NuxtLink to="/soporte/administracion/noticias">
								Noticias
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected:
								path ===
								'/soporte/administracion/biblioteca_virtual',
						}"
					>
						<span>
							<NuxtLink
								to="/soporte/administracion/biblioteca_virtual"
							>
								Biblioteca virtual
							</NuxtLink>
						</span>
					</li>
					<li
						:class="{
							Selected:
								path === '/soporte/administracion/libro_vida',
						}"
					>
						<span>
							<NuxtLink to="/soporte/administracion/libro_vida">
								Libro de vida
							</NuxtLink>
						</span>
					</li>
				</ul>
			</li>
			<li
				class="Single"
				:class="{ SelectedSingle: path === '/soporte/votaciones' }"
			>
				<NuxtLink to="/soporte/votaciones">
					<span
						><i class="fa-solid fa-check-to-slot" />
						Votaciones</span
					>
				</NuxtLink>
			</li>
		</ul>
	</nav>
</template>

<style scoped lang="scss">
.SuppMenu {
	left: -270px;
	width: 250px;
	background-color: white;
	box-shadow: rgb(71 75 255 / 10%) 0px 2px 4px;
	position: absolute;
	top: 60px;
	padding: 10px;
	height: fit-content;
	transition: all 0.4s ease;
}

.SuppMenu ul:first-child {
	overflow-y: auto;
	position: relative;
	height: calc(100vh - 80px);
}

.MenuOpen {
	left: 0;
}

ul {
	padding: 0 10px;
	list-style: none;
	ul {
		margin: 5px;
		margin-top: 5px;
		li {
			border-left: 1px solid var(--color-light);
			padding: 5px 15px;
			transition: all 0.4s;
		}
		.Wrap li:hover {
			border-left: 1px solid var(--color-main);
			a {
				color: var(--color-main);
			}
		}
	}

	.Wrap li:hover {
		border-left: 1px solid var(--color-main);
		a {
			color: var(--color-main);
		}
	}

	.Single {
		i,
		span {
			transition: all 0.4s;
		}
	}

	.Single:hover {
		color: var(--color-main);
		i,
		span {
			color: var(--color-main);
		}
	}

	span {
		cursor: default;
	}
}

.Selected {
	border-left: 1px solid var(--color-main);
}

.SelectedSingle {
	i,
	span {
		color: var(--color-main);
	}
}

.SelectedMenu {
	border-left: 1px solid var(--color-main);
}

.Selected a {
	color: var(--color-main);

	span {
		color: var(--color-main);
		i {
			color: var(--color-main);
		}
	}
}

a {
	text-decoration: none;
	transition: all 0.4s;
}

span {
	font-size: 0.8rem;
}

@media (max-width: 767.98px) {
	.SuppMenu {
		top: 50px;
	}
}

@media (max-width: 575.98px) {
	.SuppMenu {
		top: 45px;
	}
}
</style>
