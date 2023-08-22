<script setup lang="ts">
// Types
import { CalendarBlock } from '~/models/calendar/block.model'
import { Address } from '~/models/address/address'
import { HierarchyData } from '~/models/college/hierarchy_data.model'
import type { ErrorFetch } from '~~/common/fetchModule'
import { UserTypesKeys } from '~~/models/user/user.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = schoolName
	? `Colegio - Admin - ${schoolName} - Intranet`
	: 'Colegio - Admin - Intranet'
// Guard
definePageMeta({
	middleware: 'role',
	roles: [UserTypesKeys.DIRECTOR],
})
// Nuxtapp
const { $fetchModule, $collegeService, $calendarService } = useNuxtApp()

// Modal
const modalBlock = ref(false)
// Form
const block = reactive({
	hour_start: '',
	hour_finish: '',
	number: '',
})
// Data
const college = reactive({
	direction: '',
	phone: '',
	email: '',
	rbd: '',
	address: {
		street_number_name: '',
		building_site_number: '',
		city: '',
		postal_code: '',
		country: '',
		lat: 0,
		lng: 0,
	} as Address,
})
const blocks = ref<Array<CalendarBlock> | null>(null)
const hierarchies = ref<Array<HierarchyData> | null>(null)

const error = ref<ErrorFetch | null>(null)

onMounted(async () => {
	try {
		const dataFetch = await Promise.all([
			$collegeService.getCollege(),
			$collegeService.getRegisteredHierarchies(),
			$calendarService.getBlocks(),
		])
		hierarchies.value = dataFetch[1]

		college.direction = dataFetch[0].direction
		college.phone = dataFetch[0].phone
		college.email = dataFetch[0].email

		blocks.value = dataFetch[2]
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

async function addBlock() {
	const success = await $calendarService.uploadBlockCalendar(block)
	if (success) {
		// Add block
		blocks.value?.push({
			...block,
			_id: success,
			number: Number(block.number),
		})
		// Init
		block.hour_finish = ''
		block.hour_start = ''
		block.number = ''

		modalBlock.value = false
	}
}
</script>

<template>
	<NuxtLayout name="admin">
		<!-- Head -->
		<Head>
			<Title>{{ title }}</Title>
			<Meta name="robots" content="noindex, nofollow" />
		</Head>
		<!-- Body -->
		<AdminPanel :nav="false">
			<!-- Data -->
			<h2>Colegio</h2>
			<br />
			<HTMLForm :form="() => $collegeService.uploadCollegeData(college)">
				<label for="rbd">RBD</label>
				<HTMLInput id="rbd" v-model:value="college.rbd" />
				<label for="address">Direcci&oacute;n</label>
				<HTMLAddress
					id="address"
					v-model:value="college.direction"
					v-model:address="college.address"
				/>
				<label for="phone">Telef&oacute;no</label>
				<HTMLInput id="phone" v-model:value="college.phone" />
				<label for="email">Email</label>
				<HTMLInput
					id="email"
					v-model:value="college.email"
					type="email"
				/>
				<HTMLButton type="submit"> Actualizar datos </HTMLButton>
			</HTMLForm>
			<br />
			<h3><i class="fa-solid fa-sitemap"></i> Jerarqu&iacute;a</h3>
			<article
				v-for="(hierarchy, i) in hierarchies"
				:key="i"
				class="Hierarchy"
			>
				<!-- Buttons -->
				<aside>
					<HTMLAIcon
						class-item="fa-solid fa-pen-to-square"
						:href="`/admin/colegio/jerarquia/${hierarchy._id}`"
					/>
				</aside>
				<!-- Content -->
				<HTMLTable :header="['Código', 'Grado', 'Especialidad']">
					<tr
						v-for="(grade, i) in hierarchy.levels
							.filter(({ codes }) => codes)
							.flatMap(({ codes }) => codes)"
						:key="i"
					>
						<td>{{ grade?.split(':').at(0) }}</td>
						<td>{{ grade?.split(':').at(1) }}</td>
						<td>N/A</td>
					</tr>
					<!-- eslint-disable vue/no-v-for-template-key -->
					<template
						v-for="(specialty, i) in hierarchy.levels
							.filter(({ branches }) => branches)
							.flatMap(({ branches }) =>
								branches?.flatMap(({ economics }) =>
									economics.flatMap(
										({ specialties }) => specialties,
									),
								),
							)"
						:key="i"
					>
						<tr v-for="(grade, j) in specialty?.codes" :key="j">
							<td>{{ grade?.split(':').at(0) }}</td>
							<td>{{ grade?.split(':').at(1) }}</td>
							<td>{{ specialty?.value }}</td>
						</tr>
					</template>
				</HTMLTable>
				<h4>Modalidad: {{ hierarchy.modality }}</h4>
				<h4>Jornada: {{ hierarchy.schedule }}</h4>
			</article>
			<HTMLAIcon
				href="/admin/colegio/jerarquia"
				class-item="fa-solid fa-plus"
			/>
			<!-- Calendar blocks -->
			<br />
			<h3>
				<i class="fa-solid fa-table-cells"></i> Bloques de Calendario
			</h3>
			<article class="Blocks">
				<div v-for="block in blocks" :key="block._id" class="Block">
					<header>
						<h3>{{ block.number }}</h3>
					</header>
					<span class="Block__time"
						>{{ block.hour_start }} - {{ block.hour_finish }}</span
					>
				</div>
			</article>
			<HTMLButtonIcon
				title="Nuevo bloque de calendario"
				class-item="fa-solid fa-plus"
				type="button"
				:click="() => (modalBlock = !modalBlock)"
			/>
			<!-- Modals -->
			<Modal v-model:opened="modalBlock">
				<template #title>
					<h2>Nuevo bloque de calendario</h2>
				</template>
				<HTMLForm :form="addBlock">
					<label for="hstart">Hora inicio</label>
					<HTMLInput
						id="hstart"
						v-model:value="block.hour_start"
						type="time"
					/>
					<label for="hfinish">Hora final</label>
					<HTMLInput
						id="hfinish"
						v-model:value="block.hour_finish"
						type="time"
					/>
					<label for="number">N° De Bloque</label>
					<HTMLInput
						id="number"
						v-model:value="block.number"
						type="number"
					/>

					<HTMLButton type="submit">
						Agregar bloque de calendario
					</HTMLButton>
				</HTMLForm>
			</Modal>

			<SpinnerGet />
			<Error v-if="error" :err="error" />
		</AdminPanel>
	</NuxtLayout>
</template>

<style scoped lang="scss">
.Hierarchy,
.Block {
	display: flex;
	flex-direction: column;
	padding: 10px;
	gap: 10px;
	border-radius: 6px;
	border: 2px solid var(--color-light);
	margin: 10px 0;
	position: relative;
}

.Blocks {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.Block {
	width: 180px;
	header {
		border-right: 2px solid var(--color-light);
	}
	display: grid;
	grid-template-columns: 20px 1fr;
	align-items: center;
	.Block__time {
		font-weight: 900;
		display: flex;
		justify-content: center;
	}
}

.Hierarchy aside {
	position: absolute;
	right: 5px;
	bottom: 5px;
	display: flex;
	gap: 10px;
}
</style>
