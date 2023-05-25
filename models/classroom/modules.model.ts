import type { Semester } from '../semester/semester.model'
import type { Section } from '../course/course.model'
import type { Subject } from '../subject/subject.model'
import type { User } from '../user/user.model'
import type { Work } from './work.model'

export type SubSection = {
	_id: string
	name: string
}

export type DirectiveModule = {
	// eslint-disable-next-line no-use-before-define
	module: ClassroomModule
	min_grades: {
		actived: boolean
		min_grade: number
	}
	continuous: boolean
	all_grades: boolean
}

export type ClassroomModule = {
	section: Section
	sub_sections: Array<SubSection>
	semester: Semester
	status: boolean
	subject: Subject
	works?: Array<Work>
	_id: string
	students?: Array<User>
}
