import { User } from './user.model'

export interface Parent extends User {
	students: Array<User>
}
