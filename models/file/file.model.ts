import type { OID } from '../oid.model'

export interface UserFile {
	_id: OID
	filename: string
	key: string
	title: string
	type: string
	url: string
	permissions: number
	date: string
}
