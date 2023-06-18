<script lang="ts" setup>
// Types
import { User } from '~/models/user/user.model'
// NuxtApp
const { $assistanceService } = useNuxtApp()
// Stores
const toastsStore = useToastsStore()

const props = withDefaults(
	defineProps<{
		assistance: Array<{
			student: string
			assist: boolean
			exists?: boolean
		}>
		students: Array<User>
		upload?: boolean
		auditor?: User | null
		ignore?: boolean
		idSection?: string
		fullCourseName?: string
		editable?: boolean
		funcEditable?: (user: User) => any
	}>(),
	{
		upload: true,
		auditor: null,
		ignore: false,
		idSection: '',
		fullCourseName: '',
		editable: false,
		funcEditable() {},
	},
)

// Refs
const status = ref<'sync' | 'loading' | 'error' | 'no'>(
	props.auditor ? 'sync' : 'no',
)
const assistance = ref(props.assistance)
const auditor = ref(props.auditor)
const ignore = ref(props.ignore)

const emits = defineEmits<{
	(
		e: 'update:assistance',
		ass: Array<{
			student: string
			assist: boolean
		}>,
	): void
	(e: 'update:auditor', a: User): void
}>()
// Form
watch(assistance, async (newAssistance, oldAssistance) => {
	try {
		if (newAssistance && oldAssistance && !ignore.value && props.upload) {
			status.value = 'loading'
			await $assistanceService.uploadAssistance(
				newAssistance,
				props.idSection,
			)
			// Set auditor
			status.value = 'sync'

			const authStore = useAuthStore()
			auditor.value = {
				name: authStore.getName,
				user_type: authStore.getUserType,
			} as User

			emits('update:auditor', auditor.value)
		}
		ignore.value = false
	} catch (err) {
		status.value = 'error'

		toastsStore.addToast({
			message: `No se ha podido subir la asistencia del curso ${props.fullCourseName}`,
			type: 'error',
		})
		ignore.value = true
		assistance.value = oldAssistance
	} finally {
		emits('update:assistance', assistance.value)
	}
})

const isAllChecked = computed(() => {
	return assistance.value.every((student) => student.assist)
})

function toggleMark() {
	assistance.value = assistance.value.map((student) => ({
		student: student.student,
		assist: !isAllChecked.value,
	}))
}

function update() {
	assistance.value = [...assistance.value]
}
</script>

<template>
	<section class="Assistance">
		<HTMLTable :header="['Estudiante', '']">
			<!-- Header -->
			<template #header>
				<td>
					<HTMLInput
						value=""
						:checked="isAllChecked"
						type="checkbox"
						@click="toggleMark"
					/>
				</td>
			</template>
			<!-- Content -->
			<tr v-for="(student, i) in students" :key="student._id">
				<td
					:class="{
						Opacity:
							assistance[i].exists !== undefined &&
							!assistance[i].exists,
					}"
				>
					<HTMLInput
						v-model:checked="assistance[i].assist"
						value=""
						type="checkbox"
						@change="update"
					/>
				</td>
				<td
					:class="{
						Opacity:
							assistance[i].exists !== undefined &&
							!assistance[i].exists,
					}"
				>
					{{ student.name }} {{ student.first_lastname }}
					{{ student.second_lastname }}
				</td>
				<td v-if="editable">
					<HTMLButtonIcon
						:class-item="
							assistance[i].exists !== undefined &&
							!assistance[i].exists
								? 'fa-solid fa-rotate-left'
								: 'fa-solid fa-xmark'
						"
						:click="() => funcEditable(student)"
					/>
				</td>
			</tr>
		</HTMLTable>
		<!-- Auditor -->
		<footer>
			<br />
			<small v-if="status === 'sync'">
				<i class="fa-solid fa-circle-check"></i>
				Informaci&oacute;n sincronizada
			</small>
			<small v-else-if="status === 'loading'">
				<i class="fa-solid fa-spinner"></i>
				Cargando
			</small>
			<small v-else-if="status === 'error'">
				<i class="fa-solid fa-circle-xmark"></i>
				Error de sincronizaci&oacute;n
			</small>
			<small v-if="auditor">
				- Auditor: ({{ formatUserType(auditor.user_type) }})
				{{ auditor.name }}
				{{ auditor.first_lastname }}
			</small>
		</footer>
	</section>
</template>

<style scoped lang="scss">
td {
	transition: all 0.4s;
}

.Opacity {
	opacity: 0.1;
}
</style>
