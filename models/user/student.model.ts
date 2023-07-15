import type { Section } from '../course/course.model'
import type { User } from './user.model'

export interface Student extends User {
	course: Section
	registration_number?: string
	number_list: string
}

export interface Students {
	users: Array<Student>
	total?: number
}
