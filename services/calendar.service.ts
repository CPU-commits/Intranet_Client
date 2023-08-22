import { Service } from './service'
import { CalendarBlock } from '~/models/calendar/block.model'
import { BodyFetch } from '~/models/body.model'
import {
	Calendar,
	RegisteredCalendarBlock,
} from '~/models/calendar/calendar.model'
import { messages } from '@/utils/validators'
import { Event } from 'models/calendar/event.model'
import { Crisis } from 'models/calendar/crisis.model'
import { FetchGet } from 'models/fetch/defaults.model'

export class CalendarService extends Service {
	async getCalendarBySectionAndSemester(
		idSection: string,
		idSemester: string,
	) {
		return await this.fetch<BodyFetch<{ calendar: Calendar }>>({
			method: 'get',
			URL: `/api/calendars/section/${idSection}/semester/${idSemester}`,
		}).then(({ body }) => body.calendar)
	}

	async getBlocks() {
		return await this.fetch<BodyFetch<{ blocks: Array<CalendarBlock> }>>({
			method: 'get',
			URL: '/api/calendars/blocks',
		}).then(({ body }) => body.blocks)
	}

	async getProgressBlock() {
		return await this.fetch<
			BodyFetch<{
				block: Omit<RegisteredCalendarBlock, 'block'> & {
					block: CalendarBlock
				}
			}>
		>({
			method: 'get',
			URL: '/api/calendars/blocks/progress',
			params: {
				utc: -new Date().getTimezoneOffset() / 60,
			},
		}).then(({ body }) => body.block)
	}

	async getRegisteredBlock(idBlock: string, idSection: string) {
		return await this.fetch<BodyFetch<{ block: RegisteredCalendarBlock }>>({
			method: 'get',
			URL: `/api/calendars/blocks/${idBlock}/registered/section/${idSection}`,
			params: {
				utc: -new Date().getTimezoneOffset() / 60,
			},
		}).then(({ body }) => body.block)
	}

	async getRegisteredsBlockBySubjectNSection(
		idSubject: string,
		idSection: string,
	) {
		return await this.fetch<
			BodyFetch<{
				blocks: Array<
					Omit<RegisteredCalendarBlock, 'block'> & {
						block: CalendarBlock
					}
				>
			}>
		>({
			method: 'get',
			URL: `/api/calendars/blocks/registered/subject/${idSubject}/section/${idSection}`,
		}).then(({ body }) => body.blocks)
	}

	async getEventsSemester(idSemester: string, params?: FetchGet) {
		return await this.fetch<
			BodyFetch<{ events: Array<Event>; total: number | null }>
		>({
			method: 'get',
			URL: `/api/events/semester/${idSemester}`,
			params,
		}).then(({ body }) => body)
	}

	async getCrisisSemester(idSemester: string, params?: FetchGet) {
		return await this.fetch<
			BodyFetch<{ crisis: Array<Crisis>; total: number | null }>
		>({
			method: 'get',
			URL: `/api/events/crisis/semester/${idSemester}`,
			params,
		}).then(({ body }) => body)
	}

	async uploadBlockCalendar(block: {
		hour_start: string
		hour_finish: string
		number: string
	}) {
		try {
			const blockData = validators(
				{
					hour_start: {
						type: 'string',
						min: 1,
						custom_name: 'Hora inicio',
					},
					hour_finish: {
						type: 'string',
						min: 1,
						custom_name: 'Hora final',
					},
					number: {
						type: 'number',
						min: 1,
						custom_name: 'N° De Bloque',
					},
				},
				{ ...block, number: Number(block.number) },
			).transform()

			const dataFetch = await this.fetch<
				BodyFetch<{ insertedId: string }>
			>({
				method: 'post',
				URL: '/api/calendars/blocks',
				body: blockData,
			})
			this.addToast({
				message: 'Se ha subido el bloque exitosamente',
				type: 'success',
			})

			return dataFetch.body.insertedId
		} catch (err) {
			this.addErrorToast(err)

			return false
		}
	}

	async uploadCalendar(calendar: Calendar, idSection: string) {
		try {
			return await this.fetch<BodyFetch<{ insertedId: string }>>({
				method: 'put',
				URL: `/api/calendars/section/${idSection}`,
				body: {
					blocks: calendar.blocks
						.filter(({ subject }) => subject)
						.map((block) => ({
							...block,
							subject: block.subject?._id,
						})),
				},
			}).then(({ body }) => body.insertedId)
		} catch (err) {
			this.addErrorToast(err)
			throw err
		}
	}

	async uploadEvent(event: {
		name: string
		institution_type: string
		parent_institution: string
		institution: string
		date: string
		type: string
		description: string
		semester: string
		finish_date: string
	}) {
		try {
			validators(
				{
					name: {
						type: 'string',
						custom_name: 'Nombre',
						min: 1,
						max: 100,
					},
					institution_type: {
						type: 'string',
						custom_name: 'Afectado',
						min: 1,
					},
					date: {
						type: 'string',
						custom_name: 'Fecha inicio',
						min: 1,
					},
					finish_date: {
						type: 'string',
						custom_name: 'Fecha final',
						min: 1,
					},
					type: {
						type: 'string',
						custom_name: 'Tipo de evento',
						min: 1,
					},
					description: {
						type: 'string',
						custom_name: 'Descripción',
						min: 1,
						max: 500,
					},
				},
				event,
			)
			// Missing
			const iType = event.institution_type
			if (
				iType !== 'country' &&
				iType !== 'establishment' &&
				event.parent_institution === ''
			)
				throw new Error(messages.minLengthString('Sección', 1))
			if (iType === 'subject' && event.institution === '')
				throw new Error(messages.minLengthString('Materia', 1))

			const dataFetch = await this.fetch<BodyFetch<{ event: Event }>>({
				method: 'post',
				URL: '/api/events',
				body: {
					...event,
					institution:
						iType === 'section'
							? event.parent_institution
							: iType === 'subject'
							? event.institution
							: undefined,
					parent_institution:
						iType === 'subject'
							? event.parent_institution
							: undefined,
				},
			})
			this.addToast({
				message: 'Se ha subido el evento exitosamente',
				type: 'success',
			})
			return dataFetch.body.event
		} catch (err) {
			this.addErrorToast(err)
			return null
		}
	}

	async uploadCrisis(crisis: {
		name: string
		start_date: string
		type: string
		description: string
		semester: string
	}) {
		try {
			validators(
				{
					name: {
						type: 'string',
						custom_name: 'Nombre',
						min: 1,
						max: 100,
					},
					start_date: {
						type: 'string',
						custom_name: 'Fecha de inicio',
						min: 1,
					},
					type: {
						type: 'string',
						custom_name: 'Tipo',
						min: 1,
						max: 100,
					},
					description: {
						type: 'string',
						custom_name: 'Descripción',
						min: 1,
						max: 500,
					},
				},
				crisis,
			)

			const dataFetch = await this.fetch<
				BodyFetch<{ insertedId: string }>
			>({
				method: 'post',
				URL: '/api/events/crisis',
				body: crisis,
			})
			this.addToast({
				message: 'Se ha subido la crisis exitosamente',
				type: 'success',
			})
			return dataFetch.body.insertedId
		} catch (err) {
			this.addErrorToast(err)
			return null
		}
	}

	async updateCrisis(crisis: { finish_date: string }, idCrisis: string) {
		try {
			validators(
				{
					finish_date: {
						type: 'string',
						custom_name: 'Fecha final',
						min: 1,
					},
				},
				crisis,
			)

			await this.fetch({
				method: 'put',
				URL: `/api/events/crisis/${idCrisis}`,
				body: crisis,
			})
			this.addToast({
				message: 'Se ha actualizado la crisis exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	async deleteCrisis(idCrisis: string) {
		try {
			await this.fetch({
				method: 'delete',
				URL: `/api/events/crisis/${idCrisis}`,
			})
			this.addToast({
				message: 'Se ha eliminado la crisis exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	async deleteEvent(idEvent: string) {
		try {
			await this.fetch({
				method: 'delete',
				URL: `/api/events/${idEvent}`,
			})
			this.addToast({
				message: 'Se ha eliminado el evento exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}
}
