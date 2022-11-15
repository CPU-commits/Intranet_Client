import { Section } from '../course/course.model'
import { Subject } from '../subject/subject.model'
import { User } from './user.model'

export interface TeacherImparted {
	_id: string
	subject: Subject
	course: Section
}

export interface Teacher {
	_id: string
	user: User
	imparted: Array<TeacherImparted>
}

export interface Teachers {
	total?: number
	users: Array<Teacher>
}
