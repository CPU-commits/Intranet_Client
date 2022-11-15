import type { User } from '../user/user.model'

export type Observation = {
	_id: string
	student?: User
	semester: string
	author: User
	type: boolean
	observation: string
	date: string
}
