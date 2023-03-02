export enum Indexs {
	'works',
	'publications',
}

export type Hits = {
	hits: Array<{
		_id: string
		_index: keyof typeof Indexs
		_score: number

		_source: any
	}> | null
	max_score: number
	total: {
		relation: string
		value: number
	}
}
