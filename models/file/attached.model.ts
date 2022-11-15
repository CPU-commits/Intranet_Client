import type { UserFile } from './file.model'

export enum AttachedType {
	'link',
	'file',
}

export type Attached = {
	file: UserFile
	link: string
	title: string
	_id: string
	type: keyof typeof AttachedType
}
