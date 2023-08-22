<script lang="ts" setup>
// Types
import { CalendarBlock } from '~/models/calendar/block.model'
import { Calendar } from '~/models/calendar/calendar.model'
import { Subject } from '~/models/subject/subject.model'

const props = defineProps<{
	idSection: string
	idCourse: string
	idSemester: string
	editable?: boolean
}>()
// NuxtApp
const { $calendarService, $subjectService } = useNuxtApp()

// Data
const blocks = ref<Array<CalendarBlock> | null>(null)
const subjects = ref<Array<Subject> | null>(null)
const calendar = ref<Calendar | null>(null)

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

onMounted(async () => {
	await $calendarService.getBlocks().then((blocksData) => {
		blocks.value = blocksData
	})
	resetData()
})

async function resetData() {
	const dataFetch = await Promise.all([
		$calendarService.getCalendarBySectionAndSemester(
			props.idSection,
			props.idSemester,
		),
		$subjectService.getCourseSubjects(props.idCourse),
	])
	calendar.value = dataFetch[0]
	subjects.value = dataFetch[1]
	// Init calendar
	const blocksToAdd =
		blocks.value?.flatMap((block) =>
			days.flatMap((day) => ({
				day,
				block: block.number,
				subject: null,
			})),
		) ?? []
	if (!calendar.value)
		calendar.value = {
			_id: '',
			blocks: blocksToAdd,
			course: '',
			date: '',
			semester: '',
		}
	else
		calendar.value.blocks = blocksToAdd.map((v) => {
			const blockInCalendar = calendar.value?.blocks.find(
				(block) => block.block === v.block && block.day === v.day,
			)
			return blockInCalendar || v
		})
}

// Watch
watch(props, () => {
	resetData()
})

function getSubject(
	day: string,
	blockNumber: number,
): Subject | undefined | null {
	return calendar.value?.blocks.find(
		(block) => block.day === day && block.block === blockNumber,
	)?.subject
}

// Drag and drop
const draggedSubject = ref<Subject | null>(null)
const draggedIndex = ref<number | null>(null)

function handleDragStart(subject: Subject) {
	draggedSubject.value = subject
}

const handleDragOver = (e: Event) => e.preventDefault()

async function handleDrop(day: string, blockNumber: number) {
	const block = calendar.value?.blocks.find(
		(block) => block.day === day && block.block === blockNumber,
	)

	if (block && calendar.value) {
		block.subject = draggedSubject.value

		try {
			const insertedId = await $calendarService.uploadCalendar(
				calendar.value,
				props.idSection,
			)
			calendar.value._id = insertedId
		} catch (err) {
			block.subject = null
		}
	}
}
</script>

<template>
	<div class="Container">
		<section class="Calendar">
			<div class="Calendar__blocks">
				<div class="Block" />
				<div v-for="block in blocks" :key="block._id" class="Block">
					<small>
						{{ block.hour_start }}
						{{ block.hour_finish }}
					</small>
				</div>
			</div>
			<div class="Calendar__days">
				<div class="Calendar__days--row">
					<div v-for="(day, i) in days" :key="i" class="Block">
						<small>{{ day }}</small>
					</div>
				</div>
				<div
					v-for="i in blocks?.length"
					:key="i"
					class="Calendar__days--row"
				>
					<div
						v-for="(day, j) in days"
						:key="j"
						class="Block Drag"
						@dragover="handleDragOver"
						@drop="() => handleDrop(day, i)"
					>
						<small>
							{{ getSubject(day, i)?.subject }}
						</small>
					</div>
				</div>
			</div>
		</section>
		<nav v-if="editable" class="Subjects">
			<div
				v-for="(subject, i) in subjects"
				:key="subject._id"
				class="Block Drag"
				:class="{ DragStart: draggedIndex === i }"
				:draggable="true"
				@click="() => (draggedIndex = i)"
				@dragstart="() => handleDragStart(subject)"
			>
				<small>{{ subject.subject }}</small>
			</div>
		</nav>
	</div>
</template>

<style scoped lang="scss">
.Container {
	margin: auto;
}

.Calendar {
	display: flex;
	gap: 20px;
	padding: 0 20px;
}

.Calendar__blocks {
	display: flex;
	flex-direction: column;
	gap: 30px;
	padding: 0 20px;
	small {
		font-weight: bolder;
	}
}

.Calendar__days {
	display: flex;
	flex-direction: column;
	gap: 30px;
	.Calendar__days--row:first-child {
		border-bottom: 2px solid var(--color-main);
		small {
			font-weight: bolder;
			color: var(--color-main);
		}
	}
}

.Calendar__days--row {
	display: flex;
	gap: 30px;
}

.Block {
	display: flex;
	align-items: center;
	height: 50px;
	width: 100px;
}

.Block::backdrop {
	color: red;
}

.Drag {
	border: 1px solid var(--color-light);
	border-radius: 4px;
	small {
		text-align: center;
		width: 100%;
	}
}

.DragStart {
	small {
		color: red;
	}
}

.Subjects {
	margin-top: 20px;
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}

small {
	font-size: 1rem;
	text-align: center;
	width: 100%;
	overflow: hidden;
}

@media (max-width: 575.98px) {
	small {
		font-size: 0.8rem;
	}

	.Calendar {
		gap: 10px;
		padding: 0 5px;
	}

	.Calendar__blocks {
		gap: 15px;
		padding: 0 5px;
	}

	.Calendar__days {
		gap: 15px;
	}

	.Calendar__days--row {
		gap: 15px;
	}

	.Block {
		width: 80px;
		height: 40px;
	}
}
</style>
