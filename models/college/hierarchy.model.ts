export type KeyValue = {
	key: string
	value: string
}

export type Children = {
	name: string
	values: Array<
		KeyValue & { $if?: { $valref: string; $val: string } } & {
			children?: Children
		}
	>
}

export type Hierarchy = {
	modalities: Array<KeyValue & { children: Children }>
	schedule: Array<KeyValue>
}
