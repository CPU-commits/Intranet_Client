import { User } from '../user/user.model'

export type Assistance<T extends User | string = User | string> = {
	_id: string
	section: string
	assistance: Array<{
		student: T
		assist: boolean
	}>
	auditor: User
	date: Date
}
