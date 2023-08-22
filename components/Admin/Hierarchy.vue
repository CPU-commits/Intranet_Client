<script setup lang="ts">
// Types
import { Hierarchy } from '~/models/college/hierarchy.model'
import { HierarchyData } from '~/models/college/hierarchy_data.model'
import type { ErrorFetch } from '~~/common/fetchModule'

const props = withDefaults(
	defineProps<{
		startStep?: number
		startForm?: Partial<HierarchyData>
		filterGrades?: Array<string>
		buttonText?: string
		action: (modalty: HierarchyData) => any
	}>(),
	{
		startStep: 0,
		startForm: () => ({}),
		filterGrades: () => [],
		buttonText: 'Subir jerarquía',
	},
)
// Nuxtapp
const { $fetchModule, $collegeService } = useNuxtApp()
// Stores
const toastsStore = useToastsStore()

// Transitions
const step = ref(props.startStep)
const name = ref('slide-left')
// Form
type Level = {
	value: string
	branches?: Array<{
		value: string
		economics: Array<{
			value: string
			specialties: Array<{
				value: string
				codes: Array<string>
			}>
		}>
	}>
	codes?: Array<string>
}

const modalityForm = reactive({
	modality: props.startForm?.modality ?? '',
	schedule: props.startForm?.schedule ?? '',
	levels: [] as Array<Level>,
}) as HierarchyData
// Data
const hierarchy = ref<Hierarchy | null>(null)

const error = ref<ErrorFetch | null>(null)

onMounted(async () => {
	try {
		hierarchy.value = await $collegeService.getHierarchy()
	} catch (err) {
		const _err = $fetchModule.handleError(err)
		error.value = _err
	}
})

// Define herarchy
const levelIndex = computed(() => {
	return step.value - 3
})

const schedule = computed(
	() =>
		hierarchy.value?.schedule.find(
			({ key }) => key === modalityForm.schedule,
		)?.value,
)

const modalities = computed(() => {
	return hierarchy.value?.modalities.map(({ key, value }) => ({
		key,
		value,
	}))
})

const modality = computed(
	() =>
		hierarchy.value?.modalities.find(
			({ key }) => key === modalityForm.modality,
		)?.value,
)

const levels = computed(() => {
	const modality = hierarchy.value?.modalities.find(
		({ key }) => key === modalityForm.modality,
	)

	return modality?.children.values
})

const level = computed(() => {
	const selectedLevel = modalityForm.levels.at(levelIndex.value)
	if (!selectedLevel) return null

	const level = levels.value?.find(({ key }) => key === selectedLevel.value)

	return level
})

const branches = computed(() => {
	return modalityForm.levels
		.flatMap((level) => level.branches?.map((branch) => branch))
		.filter((b) => b)
})

function getBranch(keyBranch: string) {
	return level.value?.children?.values.find(({ key }) => key === keyBranch)
}

const economics = computed(() => {
	return branches.value.flatMap((branch) =>
		branch?.economics.map((economic) => economic),
	)
})

function getEconomic(keyEconomic: string) {
	let index = 0
	const branch = level.value?.children?.values.find(({ children }) =>
		children?.values.some(({ key }, i) => {
			index = i
			return key === keyEconomic
		}),
	)
	return branch?.children?.values[index]
}

const specialties = computed(() => {
	return economics.value.flatMap((economic) =>
		economic?.specialties.map((specialtie) => specialtie),
	)
})

function getSpecialty(keySpecialty: string) {
	let indexEconomic = 0
	let indexSpecialty = 0
	const branch = level.value?.children?.values.find(({ children }) =>
		children?.values.some(({ children }, i) => {
			indexEconomic = i
			return children?.values.some(({ key }, j) => {
				indexSpecialty = j
				return key === keySpecialty
			})
		}),
	)
	return branch?.children?.values[indexEconomic].children?.values[
		indexSpecialty
	]
}

// Validations
function validateStep() {
	try {
		if (step.value === 0 && modalityForm.schedule === '')
			throw new Error('Debe seleccionar una jornada')
		if (step.value === 1 && modalityForm.modality === '')
			throw new Error('Debe seleccionar una modalidad')
		if (step.value === 2 && modalityForm.levels.length === 0)
			throw new Error('Debe seleccionar al menos un nivel')
		if (
			step.value >= 3 &&
			(modalityForm.levels[levelIndex.value].codes?.length === 0 ||
				modalityForm.levels[levelIndex.value].branches?.flatMap(
					({ economics }) =>
						economics.flatMap(({ specialties }) =>
							specialties.flatMap(({ codes }) => codes),
						),
				).length === 0)
		)
			throw new Error('Debe seleccionar al menos un grado')
		return true
	} catch (err) {
		toastsStore.addToast({
			message: (err as Error).message,
			type: 'error',
		})
		return false
	}
}
</script>

<template>
	<!-- eslint-disable vue/attributes-order -->
	<section>
		<HTMLForm class="Hierarchy" :form="() => action(modalityForm)">
			<!-- Modalities -->
			<Transition mode="out-in" :name="name">
				<div v-if="step === 0">
					<label for="schedule">Jornada</label>
					<HTMLSelect
						id="schedule"
						v-model:value="modalityForm.schedule"
					>
						<option value="">Selecciona una jornada</option>
						<option
							v-for="(schedule, i) in hierarchy?.schedule"
							:key="i"
							:value="schedule.key"
						>
							{{ schedule.value }}
						</option>
					</HTMLSelect>
				</div>
				<div v-else-if="step === 1">
					<label for="modality">Modalidad</label>
					<HTMLSelect
						id="modalty"
						v-model:value="modalityForm.modality"
					>
						<option value="">Selecciona una modalidad</option>
						<option
							v-for="(modality, i) in modalities"
							:key="i"
							:value="modality.key"
						>
							{{ modality.value }}
						</option>
					</HTMLSelect>
				</div>
				<div v-else-if="step === 2">
					<label for="level">Nivel</label>
					<HTMLMultiple
						v-if="levels"
						id="level"
						:value="modalityForm.levels.map(({ value }) => value)"
						:options="levels"
						@update:value="(option: Array<string>) => {
								modalityForm.levels = option.map((opt) => {
									const levelFounded = levels?.find(({ key }) => key === opt)

									const levelToForm: Level = {
										value: opt,
									}
									const levelInForm = modalityForm.levels.find(({ value }) => value === opt)
									if (levelFounded?.children?.name === 'branch')
										levelToForm.branches = levelInForm ? levelInForm.branches : []
									else levelToForm.codes = levelInForm ? levelInForm.codes : []

									return levelToForm
								})
							}"
					/>
				</div>
				<!-- Levels -->
				<div v-else-if="step >= 3 && level !== null">
					<h3>{{ level?.value }}</h3>
					<!-- Branches / Economic / Specialties  -->
					<div
						v-if="level?.children?.name === 'branch'"
						class="Specialties"
					>
						<div class="Full">
							<label for="branches">Ramas</label>
							<HTMLMultiple
								id="branches"
								:value="
									modalityForm.levels[
										levelIndex
									].branches?.map(({ value }) => value)
								"
								legend="Ramas de especialidad"
								:options="level.children.values"
								@update:value="(options: Array<string>) => {
										modalityForm.levels[levelIndex].branches = options.map((option) => ({
											value: option,
											economics: [],
										}))
									}"
							/>
						</div>
						<div class="Full">
							<h3>Sectores econ&oacute;micos</h3>
							<div class="Multiples">
								<div v-for="(branch, i) in branches" :key="i">
									<HTMLMultiple
										v-if="branch"
										:value="
											branch.economics.map(
												({ value }) => value,
											)
										"
										:legend="getBranch(branch.value)?.value"
										:options="
											getBranch(branch.value)?.children
												?.values
										"
										@update:value="(options: Array<string>) => {
												const level = modalityForm.levels[levelIndex]
												if (level.branches)
													level.branches[i].economics = options.map((opt) => ({
														value: opt,
														specialties: [],
													}))
											}"
									/>
								</div>
							</div>
						</div>
						<div class="Full">
							<h3>Especialidades</h3>
							<div class="Multiples">
								<div
									v-for="(economic, j) in economics"
									:key="j"
								>
									<HTMLMultiple
										v-if="economic"
										:value="
											economic?.specialties.map(
												({ value }) => value,
											) ?? []
										"
										:legend="
											getEconomic(economic.value)?.value
										"
										:options="
											getEconomic(economic.value)
												?.children?.values
										"
										@update:value="(options: Array<string>) => {
												const levelV = modalityForm.levels[levelIndex]
												// Branch
												let index = 0
												const branch = levelV.branches?.
													find((branch) => branch.economics.some(({ value }, i) => {
														index = i

														return value === economic.value
													}))
												if (branch)
													branch.economics[index].specialties = options.map((opt) => ({
														value: opt,
														codes: [],
													}))
											}"
									/>
								</div>
							</div>
						</div>
						<div class="Full">
							<h3>Grados</h3>
							<div class="Multiples">
								<div
									v-for="(specialtie, i) in specialties"
									:key="i"
								>
									<HTMLMultiple
										v-if="specialtie"
										v-model:value="specialtie.codes"
										:legend="
											getSpecialty(specialtie.value)
												?.value
										"
										:options="
											getSpecialty(specialtie.value)
												?.children?.values.filter(
													({ $if }) => {
														if (!$if) return true

														if (
															$if.$valref ===
															'$modalities'
														)
															return (
																modalityForm.modality ===
																$if.$val
															)
													},
												)
												.filter(
													({ key }) =>
														!filterGrades.includes(
															key,
														),
												)
										"
									/>
								</div>
							</div>
						</div>
					</div>
					<div v-else class="Full">
						<h3>Grados</h3>
						<HTMLMultiple
							legend="Grados académicos"
							v-model:value="
								modalityForm.levels[levelIndex].codes
							"
							:options="
								level?.children?.values.filter(
									({ key }) => !filterGrades.includes(key),
								)
							"
						/>
					</div>
				</div>
				<div v-else-if="level === null">
					<h3>Resumen de jerarqu&iacute;a</h3>
					<!-- Summarize -->
					<p><strong>Jornada</strong>: {{ schedule }}</p>
					<p><strong>Modalidad</strong>: {{ modality }}</p>
					<HTMLTable :header="['Código', 'Grado']">
						<tr
							v-for="(grade, i) in modalityForm.levels.flatMap(
								({ branches, codes }) => [
									...(branches?.flatMap(({ economics }) =>
										economics.flatMap(({ specialties }) =>
											specialties.flatMap(
												({ codes }) => codes,
											),
										),
									) ?? []),
									...(codes ?? []),
								],
							)"
							:key="i"
						>
							<td>{{ grade.split(':').at(0) }}</td>
							<td>{{ grade.split(':').at(1) }}</td>
						</tr>
					</HTMLTable>

					<HTMLButton type="submit">
						{{ buttonText }}
					</HTMLButton>
				</div>
			</Transition>
		</HTMLForm>
		<footer>
			<HTMLButtonIcon
				:click="
					() => {
						name = 'slide-right'
						if (step > 0 && startStep < step) step--
					}
				"
				:one-hundred="false"
				class-item="fa-solid fa-caret-left"
			/>
			<HTMLButtonIcon
				:click="
					() => {
						name = 'slide-left'
						if (
							validateStep() &&
							step < 3 + modalityForm.levels.length
						)
							step++
					}
				"
				:one-hundred="false"
				class-item="fa-solid fa-caret-right"
			/>
		</footer>

		<SpinnerGet />
		<Error v-if="error" :err="error" />
	</section>
</template>

<style scoped lang="scss">
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
	transition: all 0.2s;
}
.slide-left-enter-from {
	opacity: 0;
	transform: translate(50px, 0);
}
.slide-left-leave-to {
	opacity: 0;
	transform: translate(-50px, 0);
}
.slide-right-enter-from {
	opacity: 0;
	transform: translate(-50px, 0);
}
.slide-right-leave-to {
	opacity: 0;
	transform: translate(50px, 0);
}

.Hierarchy div:first-child {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 10px;
	label,
	h3 {
		font-weight: 500;
		font-size: 1.5rem;
		padding-bottom: 30px;
		text-align: center;
	}
}

footer {
	display: flex;
	justify-content: center;
}

.Specialties {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.Full {
	width: 100%;
	padding: 0 !important;
	align-items: baseline !important;
	label,
	h3 {
		padding-bottom: 15px !important;
		text-align: left !important;
	}
	.Multiples {
		display: flex;
		flex-direction: column;
		gap: 15px;

		div:first-child {
			padding: 0 !important;
		}
	}
}

p {
	padding-bottom: 10px;
}
</style>
