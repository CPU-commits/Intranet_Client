import { CalendarBlock } from '../calendar/block.model'
import { RegisteredCalendarBlock } from '../calendar/calendar.model'

export type Session = {
	_id: string
	student: string
	work: string
	block: Omit<RegisteredCalendarBlock, 'block'> & { block: CalendarBlock }
	in_date: string
	pregrade: number
	file?: string
	date: string
}
