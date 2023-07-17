import { DefaultResponse } from '~/common/fetchModule'

export type BodyFetch<T> = {
	body: T
} & DefaultResponse
