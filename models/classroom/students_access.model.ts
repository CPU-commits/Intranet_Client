import { FilesUploadedClassroom } from '../file/files_uploaded.model'
import { User } from '../user/user.model'
import { FormAccess } from './form_access.model'
import { Session } from './session.model'

export type StudentAccess = {
	access: FormAccess
	files_uploaded: FilesUploadedClassroom
	user: User
	evaluate?: {
		percentage: number
		points_total: number
	}
	session: Session
}
