import { UserFile } from '../file/file.model'
import type { User } from '../user/user.model'
import type { Subject } from '../subject/subject.model'
import type { Cycle } from './cycle.model'

export interface Course {
	_id: string
	key: string
	isTec: boolean
	course: string
	level: number
	// eslint-disable-next-line no-use-before-define
	sections: Array<Section>
	cycle: Cycle
	subjects: Array<Subject>
	isFinal: boolean | string
}

export interface Section {
	section: string
	course: Course
	header_teacher: User | string
	next_section?: Section
	is_next_section_variable: boolean
	_id: string
	tec?: string
	file: UserFile
}
