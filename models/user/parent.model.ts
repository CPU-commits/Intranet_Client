import { Address } from '../address/address'
import { User } from './user.model'

export interface Parent extends User {
	students: Array<User>
	phone: string
	address: Address
}
