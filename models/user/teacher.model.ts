import { Section } from '../course/course.model'
import { Subject } from '../subject/subject.model'
import { User } from './user.model'

export interface TeacherImparted {
	_id: string
	subject: Subject
	course: Section
}

export interface DegreeOrCertificate {
	_id: string
	title_or_subject: string
	type: string
	award_date: Date | string
	institution: string
	accreditation:
		| 'regional'
		| 'programmatic'
		| 'national'
		| 'faith'
		| 'career_related'
		| 'not_accredited'
	verification_method:
		| 'official_transcript'
		| 'transcript_copy'
		| 'degree_copy'
		| 'grade_report'
		| 'other'
}

export interface Teacher {
	_id: string
	user: User
	imparted: Array<TeacherImparted>
	degree_or_certificate?: DegreeOrCertificate
}

export interface Teachers {
	total?: number
	users: Array<Teacher>
}
