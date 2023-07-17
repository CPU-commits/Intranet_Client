import type { Section } from '../course/course.model'
import { UserFile } from '../file/file.model'
import type { User } from './user.model'

export interface Student extends User {
	course: Section
	registration_number?: string
	number_of_list?: string
	registration: {
		registration_type: string
		file?: UserFile | string
	}
}

export interface Students {
	users: Array<Student>
	total?: number
}
