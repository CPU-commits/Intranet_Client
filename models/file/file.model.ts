import type { OID } from '../oid.model'

export interface $DATE {
	$date: number
}

export interface UserFile {
	_id: OID | string
	filename: string
	key: string
	title: string
	type: string
	url: string
	permissions: number
	date: string | $DATE
}
