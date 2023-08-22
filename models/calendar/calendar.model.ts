import { Course } from '../course/course.model'
import { Subject } from '../subject/subject.model'

export type RegisteredCalendarBlock = {
	_id?: string
	day: string
	block: number
	subject: Subject | null
}

export type Calendar = {
	_id: string
	blocks: Array<RegisteredCalendarBlock>
	semester: string | Course
	course: string
	date: string
}
