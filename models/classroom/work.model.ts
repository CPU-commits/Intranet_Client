import type { User } from '../user/user.model'
import type { Attached } from '../file/attached.model'
import type { GradeProgram } from './grade.model'

export type WorkPatternItem = {
	_id?: string
	title: string
	description: string
	points: number
}

export enum WorkType {
	'',
	'files',
	'form',
}

export type WorkBuild = {
	title: string
	description?: string
	is_qualified: string
	grade?: string
	type: keyof typeof WorkType
	form: string
	pattern: Array<WorkPatternItem>
	date_start: string
	time_start: string
	date_limit: string
	time_limit: string
	form_access: string
	time_access: string
}

export type Work = {
	_id: string
	acumulative: string | undefined
	author: User
	attached: Attached[] | null
	title: string
	description?: string
	is_qualified: string
	is_revised: boolean
	grade: GradeProgram
	type: keyof typeof WorkType
	form: string
	pattern: Array<WorkPatternItem>
	date_start: string
	time_start: string
	date_limit: string
	time_limit: string
	form_access: string
	module: string
	time_access: number
	date_upload: string
	date_update: string
}
