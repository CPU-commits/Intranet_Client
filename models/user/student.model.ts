import type { User } from './user.model'
import type { Section } from '../course/course.model'

export interface Student extends User {
    course: Section
    registration_number?: string
}

export interface Students {
    users: Array<Student>
    total?: number
}
