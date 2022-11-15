import type { User } from '../user/user.model'

export type GradeSee = {
	_id?: string
	grade: number
	is_acumulative: boolean
	evaluator?: {
		name: string
		first_lastname: string
	}
	acumulative: Array<{
		_id: string
		grade: number
		evaluator: {
			name: string
			first_lastname: string
		}
		date: string
	}>
	date: string
}

export type StudentGrade = {
	student: User
	grades: Array<GradeSee | null>
}
