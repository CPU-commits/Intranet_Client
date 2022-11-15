import type { User } from './user.model'

export interface Directives {
	total?: number
	users: Array<User>
}
