import { UserFile } from '../file/file.model'
import type { User } from '../user/user.model'
import type { Cycle } from './cycle.model'
import type { Subject } from '../subject/subject.model'


export interface Section {
    section: string
    course: Course
    header_teacher: User | string
    next_section?: Section
    is_next_section_variable: boolean
    _id: string
    file: UserFile
}

export interface Course {
    _id: string
    course: string
    level: number
    sections: Array<Section>
    cycle: Cycle
    subjects: Array<Subject>
    isFinal: boolean | string
}
