import { Service } from './service'
import { Assistance } from '~/models/assistance/assistance'
import { AssistanceBlock } from '~/models/assistance/blocks'
import {
	Record,
	RecordPresentKeys,
	RecordStatusKeys,
	RecordTypesKeys,
} from '~/models/assistance/record'
import { BodyFetch } from '~/models/body.model'
import { Calendar } from '~/models/calendar/calendar.model'
import { Course } from '~/models/course/course.model'
import { FetchGet } from '~/models/fetch/defaults.model'
import { Semester } from '~/models/semester/semester.model'
import { User, UserTypesKeys } from '~/models/user/user.model'

export class AssistanceService extends Service {
	async getStudentRecords(idStudent: string, params?: FetchGet) {
		return await this.fetch<
			BodyFetch<{ records: Array<Record>; total: number | null }>
		>({
			method: 'get',
			URL: `/api/student_records/${idStudent}`,
			params,
		}).then(({ body }) => body)
	}

	async getAssistancesSection(idSection: string, params?: FetchGet) {
		const dataFetch = await this.fetch<
			BodyFetch<{
				total: number
				assistances: Array<Assistance<User>>
			}>
		>({
			method: 'get',
			URL: `/api/assistance/${idSection}`,
			params,
		})

		return dataFetch.body
	}

	async getCurrentAssistanceSection(idSection: string, idBlock: string) {
		const dataFetch = await this.fetch<
			BodyFetch<{ assistance: Assistance<string> | null }>
		>({
			method: 'get',
			URL: `/api/assistance/${idSection}/${idBlock}/current`,
			params: {
				utc: -new Date().getTimezoneOffset() / 60,
			},
		})

		return dataFetch.body.assistance
	}

	async getBlocks(params?: FetchGet) {
		const dataFetch = await this.fetch<
			BodyFetch<{
				blocks: Array<AssistanceBlock>
			}>
		>({
			method: 'get',
			URL: '/api/assistance/blocks',
			params: {
				...params,
				utc: -new Date().getTimezoneOffset() / 60,
			},
			abort: {
				url: 'same',
			},
		})

		return dataFetch.body.blocks
	}

	async getHistory(params?: FetchGet) {
		return await this.fetch<
			BodyFetch<{
				history: {
					semesters: Array<{
						calendar: Omit<Omit<Calendar, 'blocks'>, 'course'> & {
							course: Course
						}
						semester: Semester
					}>
				}
				total: number | null
			}>
		>({
			method: 'get',
			URL: '/api/assistance/history',
			params,
		}).then(({ body }) => body)
	}

	async uploadAssistance(
		assistance: Array<{ student: string; assist: boolean }>,
		idSection: string,
		idBlock: string,
		date?: string,
	) {
		await this.fetch({
			method: 'post',
			URL: `/api/assistance/${idSection}/${idBlock}`,
			body: {
				assistance,
				date,
			},
			abort: {
				url: 'same',
			},
			params: {
				utc: -new Date().getTimezoneOffset() / 60,
			},
		})
	}

	async uploadRecord(
		record: {
			record: string
			type: string
			status: string
			present: string
			otp: string
			comments: string
			reason: string
			otp_parent: string
			parent: string
			block: string
		},
		idStudent: string,
	) {
		try {
			validators(
				{
					record: {
						custom_name: 'Tipo de registro',
						type: 'string',
						min: 1,
					},
					comments: {
						custom_name: 'Tipo',
						type: 'string',
						max: 500,
					},
					otp: {
						custom_name: 'otp',
						type: 'string',
						min: 1,
					},
				},
				record,
			)
			// Validate and generate struct
			const newRecord = new Map()
			newRecord.set('otp', record.otp)
			if (record.comments !== '')
				newRecord.set('comment', record.comments)
			if (record.record === 'absent') {
				validators(
					{
						type: {
							type: 'string',
							custom_name: 'Tipo',
							min: 1,
						},
						status: {
							type: 'string',
							custom_name: 'Estado',
							min: 1,
						},
						present: {
							type: 'string',
							custom_name: 'Presencialidad',
							min: 1,
						},
					},
					record,
				)
				newRecord.set('type', record.type)
				newRecord.set('status', record.status)
				newRecord.set('present', record.present)
				if (this.authStore.userTypeIs(UserTypesKeys.TEACHER))
					newRecord.set('block', record.block)
			} else if (record.record === 'early') {
				validators(
					{
						reason: {
							type: 'string',
							custom_name: 'Motivo',
							min: 1,
						},
						parent: {
							type: 'string',
							custom_name: 'Persona que retira',
							min: 1,
						},
					},
					record,
				)
				newRecord.set('reason', record.reason)
				newRecord.set(
					'type',
					this.authStore.userTypeIs(UserTypesKeys.TEACHER)
						? RecordTypesKeys.CLASS
						: RecordTypesKeys.ESTABLISHMENT,
				)
				newRecord.set('status', RecordStatusKeys.EARLY_DEPARTURE)
				newRecord.set('parent', record.parent)
				if (
					this.authStore.userTypeNotIs(UserTypesKeys.TEACHER) &&
					record.otp_parent !== ''
				)
					newRecord.set('otp_parent', record.otp_parent)
			} else if (record.record === 'reingress') {
				newRecord.set('type', RecordTypesKeys.ESTABLISHMENT)
				newRecord.set('status', RecordStatusKeys.AUTHORIZED_RE_ENTRY)
				newRecord.set('present', RecordPresentKeys.IN_SCHOOL)
			}

			return await this.fetch<BodyFetch<{ record: Record }>>({
				method: 'post',
				URL: `/api/student_records/${idStudent}`,
				body: {
					...Object.fromEntries(newRecord),
					date: new Date().toISOString(),
				},
				params: {
					utc: -new Date().getTimezoneOffset() / 60,
				},
			}).then(({ body }) => body.record)
		} catch (err) {
			this.addErrorToast(err)
			return null
		}
	}

	async updateRecord(
		idRecord: string,
		record: { comment?: string; reason?: string; file?: File | null },
	) {
		try {
			const formData = new FormData()
			if (record.comment) formData.append('comment', record.comment)
			if (record.reason) formData.append('reason', record.reason)
			if (record.file) formData.append('file', record.file)

			await this.fetch({
				method: 'put',
				URL: `/api/student_records/${idRecord}`,
				body: formData,
			})
			this.addToast({
				message: 'Se ha actualizado el registro exitosamente',
				type: 'success',
			})

			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	async sign(
		signature: { random_key: string; date: Date },
		idSection: string,
		idBlock: string,
	) {
		try {
			validators(
				{
					random_key: { type: 'string', min: 1, custom_name: 'OTP' },
					date: { type: 'date', custom_name: 'Fecha' },
				},
				signature,
			)

			await this.fetch({
				method: 'post',
				URL: `/api/assistance/${idSection}/${idBlock}/sign`,
				body: {
					random_key: signature.random_key,
					date: signature.date.toISOString(),
				},
				params: {
					utc: -new Date().getTimezoneOffset() / 60,
				},
			})
			this.addToast({
				message: 'Se ha firmado la asistencia exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}
}
