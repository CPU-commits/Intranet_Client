import type { UserFile } from '../file/file.model'
import type { User } from '../user/user.model'

export enum NewsType {
	'global',
	'student',
}

export type News = {
	author: User
	headline: string
	image: UserFile
	body: string
	type: keyof typeof NewsType
	title: string
	upload_date: string
	update_date: string
	url: string
	like: boolean
	likes: number
	_id: string
}
