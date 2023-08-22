<script setup lang="ts">
// Types
import type { ClassroomModule } from '~~/models/classroom/modules.model'
import { UserTypesKeys } from '~~/models/user/user.model'
import { formatMiniDate } from '~~/utils/format'
// Stores
const auth = useAuthStore()

const props = defineProps<{
	moduleData: ClassroomModule
	isHistory?: boolean
}>()

const name = computed(() => {
	let title = `${props.moduleData.subject.subject}`
	if (
		auth.userTypeIs(UserTypesKeys.TEACHER, UserTypesKeys.ATTORNEY) ||
		props.isHistory
	)
		title += `- ${props.moduleData.section.course.course} ${props.moduleData.section.section}`
	if (props.isHistory)
		title += `- ${props.moduleData.semester.year} ${props.moduleData.semester.semester}°`
	return title
})

const studentsModal = ref(false)
</script>

<template>
	<article class="Module">
		<NuxtLink :to="`/aula_virtual/clase/${moduleData._id}`">
			<header>
				<NuxtImg
					:class="isHistory ? 'IsHistoryImg' : ''"
					:src="moduleData.section.file.url"
					:alt="moduleData.section.section"
					loading="lazy"
					@error="$event.target.src = '/img/no_image.svg'"
				/>
				<h3>{{ name }}</h3>
			</header>
		</NuxtLink>
		<div v-if="!isHistory" class="Module__work">
			<span>Pr&oacute;ximas entregas</span>
			<br />
			<NuxtLink
				v-for="(work, i) in moduleData.works"
				v-if="moduleData.works && moduleData.works.length > 0"
				:key="i"
				:to="`/aula_virtual/clase/{moduleData._id}/trabajos/${work._id}`"
			>
				<article class="Work">
					<h5>
						<i
							v-if="work.type === 'form'"
							class="fa-solid fa-clipboard"
						/>
						<i
							v-else-if="work.type === 'files'"
							class="fa-solid fa-file-arrow-up"
						></i>
						<i v-else class="fa-solid fa-school-flag"></i>
						{{ work.title }}
					</h5>
					<small>
						<i
							v-if="work.is_qualified"
							title="Calificado"
							style="color: var(--color-main)"
							class="fa-solid fa-certificate"
						/>
						{{ formatMiniDate(work.date_limit) }}
					</small>
				</article>
			</NuxtLink>
			<small v-else>
				<i class="fa-solid fa-campground" />
				Sin pr&oacute;ximas entregas...
			</small>
		</div>
		<HTMLButtonIcon
			v-if="
				auth.userTypeIs(UserTypesKeys.ATTORNEY) && moduleData.students
			"
			class="Module__work--students"
			class-item="fa-solid fa-graduation-cap"
			:one-hundred="false"
			hover="white"
			:click="() => (studentsModal = true)"
		/>
		<footer>
			<!--<i class="fa-solid fa-chart-line" />-->
		</footer>
		<!-- Modal -->
		<Modal v-model:opened="studentsModal">
			<template #title>
				<h2>Estudiantes en m&oacute;dulo {{ name }}</h2>
			</template>
			<HTMLTable :header="['Nombre', 'RUT']">
				<tr v-for="student in moduleData.students" :key="student._id">
					<td>{{ student.name }} {{ student.first_lastname }}</td>
					<td>{{ student.rut }}</td>
				</tr>
			</HTMLTable>
		</Modal>
	</article>
</template>

<style lang="scss" scoped>
.light-mode .Module {
	box-shadow: var(--box-shadow);
}

.Module {
	transition: all 0.4s;
	border-radius: 6px;
	border: 2px solid var(--color-light);
	position: relative;
}

.Module:hover {
	box-shadow: none;
}

header {
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 1rem;
	position: relative;
	img {
		width: 100%;
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;
		height: 120px;
		object-fit: cover;
		filter: brightness(0.5);
	}
	h3 {
		position: absolute;
		color: white;
		text-align: center;
		span {
			color: white;
		}
	}
}

.IsHistoryImg {
	border-radius: 5px;
}

.Module__work {
	padding: 10px;
	span {
		color: var(--color-main);
		font-size: 0.8rem;
	}
	min-height: 100px;
}

.Module__work--students {
	position: absolute;
	right: -10px;
	bottom: -10px;
	background-color: var(--color-main);
	border-radius: 80%;
	padding: 6px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 0;
}

.Work {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 5px;
	margin-top: 5px;
}

a:hover h5 {
	color: var(--color-main);
}

h5 {
	transition: all 0.4s;
}

.Work small {
	font-size: 0.75rem;
}

footer {
	position: absolute;
	right: 10px;
	bottom: 10px;
}

a {
	text-decoration: none;
}

@media (max-width: 575.98px) {
	header h3 {
		font-size: 1rem;
	}

	small {
		font-size: 0.8rem;
	}
}
</style>
