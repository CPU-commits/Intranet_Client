import { Section } from '../course/course.model'
import { TeacherImparted } from './teacher.model'

export enum UserTypes {
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
}

export enum UserTypesKeys {
	STUDENT = 'a',
	STUDENT_DIRECTIVE = 'b',
	ATTORNEY = 'c',
	TEACHER = 'd',
	DIRECTIVE = 'e',
	DIRECTOR = 'f',
	LIBRARIAN = 'g',
}

export interface User {
	name: string
	first_lastname: string
	second_lastname: string
	rut: string
	status?: number
	email?: string
	phone?: string
	_id: string
	birthday: string
	gender: 'h' | 'm' | ''
	user_type: keyof typeof UserTypes
}

export interface AnyUser extends User {
	course?: Section
	registration_number?: string
	imparted?: Array<TeacherImparted>
}
