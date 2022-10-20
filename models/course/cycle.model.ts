import type { User } from '../user/user.model'

export interface Cycle {
    _id: string
    cycle: string
    members?: Array<User>
}
