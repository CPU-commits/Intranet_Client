import { User } from '../user/user.model'

export enum FormAccessStatus {
	'opened',
	'finished',
	'revised',
}

export type FormAccess = {
	_id: string
	student: string | User
	work: string
	date: string
	status: keyof typeof FormAccessStatus
}
