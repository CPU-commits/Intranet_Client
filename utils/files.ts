import { OID } from '@/models/oid.model'

export function getFileID(_id: OID | string) {
	if (typeof _id === 'string') return _id
	return _id.$oid
}
