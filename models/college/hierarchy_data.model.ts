export type HierarchyLevel = {
	value: string
	branches?: Array<{
		value: string
		economics: Array<{
			value: string
			specialties: Array<{
				value: string
				codes: Array<string>
			}>
		}>
	}>
	codes?: Array<string>
}

export type HierarchyData = {
	_id: string
	modality: string
	schedule: string
	levels: Array<HierarchyLevel>
}
