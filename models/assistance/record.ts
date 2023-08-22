import { UserFile } from '../file/file.model'
import { User } from '../user/user.model'

// Record status
export enum RecordStatusKeys {
	UNEXCUSED_ABSENCE = 'unexcused_absence',
	EXCUSED_ABSENCE = 'excused_absence',
	TARDY = 'tardy',
	EARLY_DEPARTURE = 'early_departure',
	AUTHORIZED_RE_ENTRY = 'authorized_re-entry',
}

enum RecordStatus {
	'unexcused_absence',
	'excused_absence',
	'tardy',
	'early_departure',
	'authorized_re-entry',
}

// Record types
export enum RecordTypesKeys {
	DAILY = 'daily',
	CLASS = 'class/section',
	ESTABLISHMENT = 'establishment',
	PROGRAM = 'program',
	EXTRACURRICULAR = 'extracurricular',
}

export enum RecordTypes {
	'daily',
	'class/section',
	'establishment',
	'program',
	'extracurricular',
}

// Reasons
export enum RecordReasonsKeys {
	DISCIPLINARY = 'disciplinary_action',
	FAMILY = 'family_activity',
	FAMILY_EMERGENCY = 'family_emergency',
	HEALTH = 'health',
	LEGAL = 'legal',
	NONINSTRUCIONAL = 'noninstrucional',
	RELIGIOUS = 'religous',
	UNKNOWN = 'unknown',
	EMPLOYMENT = 'student_employment',
	SKIPPING = 'skipping_school',
	TRANSPORTATION = 'transportation_naval',
}

enum RecordReasons {
	'disciplinary_action',
	'family_activity',
	'family_emergency',
	'health',
	'legal',
	'noninstrucional',
	'religous',
	'unknown',
	'student_employment',
	'skipping_school',
	'transportation_naval',
}

// Present categories
export enum RecordPresentKeys {
	DISCIPLINARY = 'disciplinary',
	IN_SCHOOL = 'in_school',
	NONTRADITIONAL = 'nontraditional',
	OUT_SCHOOL_PROGRAM = 'out_school_program',
	OUT_SCHOOL_EXTRACURRICULAR = 'out_school_extracurricular',
}

export enum RecordPresent {
	'disciplinary',
	'in_school',
	'nontraditional',
	'out_school_program',
	'out_school_extracurricular',
}

export type Record = {
	_id: string
	status: keyof typeof RecordStatus
	reason?: keyof typeof RecordReasons
	present?: keyof typeof RecordPresent
	type: keyof typeof RecordTypes
	comment?: string
	auditor: User
	student: User
	date: string
	parent?: {
		user: User
		is_signed: boolean
		signature_file: UserFile
	}
}
