import type { UserFile } from '../file/file.model'
import type { User } from '../user/user.model'

export type Annoucement = {
	_id: string
	files: Array<UserFile>
	user: User
	annoucement: string
	upload_date: string | Date
	update_date: string | Date
}
