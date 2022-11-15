import type { Specialty } from './specialty.model'

export interface Subject {
	subject: string
	specialty?: Specialty
	_id: string
}
