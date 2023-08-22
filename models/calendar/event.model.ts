import { Section } from 'models/course/course.model'
import { Subject } from 'models/subject/subject.model'

export enum EventType {
	'emergency',
	'holiday',
	'instructional',
	'other',
	'strike',
	'late_arrival_early_dismissal',
	'teacheronly',
}

export type Event = {
	_id: string
	name: string
	institution_type: 'establishment' | 'section' | 'subject' | 'country'
	institution?: Subject | Section
	parent_institution?: Section
	date: string
	finish_date: string
	type: keyof typeof EventType
	semester: string
	description: string
}
