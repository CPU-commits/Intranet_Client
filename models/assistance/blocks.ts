import { CalendarBlock } from '../calendar/block.model'

export type AssistanceBlock = {
	subject: string
	block: CalendarBlock
	section: {
		_id: string
		section: string
	}
	course: string
	exists_assistance: boolean
	signed: boolean
}
