import { DefaultResponse, Fetch } from '~/common/fetchModule'
import { Assistance } from '~/models/assistance/assistance'
import { BodyFetch } from '~/models/body.model'
import { Section } from '~/models/course/course.model'
import { FetchGet } from '~/models/fetch/defaults.model'
import { User } from '~/models/user/user.model'

export class AssistanceService {
	private readonly fetch: Fetch
	private readonly authStore = useAuthStore()

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	async getAssistancesSection(idSection: string, params?: FetchGet) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				total: number
				assistances: Array<Assistance<User>>
			}>
		>({
			method: 'get',
			URL: `/api/assistance/${idSection}`,
			token: this.authStore.getToken,
			params,
		})

		return dataFetch.body
	}

	async getCurrentAssistanceSection(idSection: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{ assistance: Assistance<string> | null }>
		>({
			method: 'get',
			URL: `/api/assistance/${idSection}/current`,
			token: this.authStore.getToken,
		})

		return dataFetch.body.assistance
	}

	async getSections(params?: FetchGet) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				sections: Array<Section & { exists_assistance: boolean }>
				total: number
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: '/api/assistance/sections',
			token: this.authStore.getToken,
			params,
			abort: {
				url: 'same',
			},
		})

		return dataFetch.body
	}

	async uploadAssistance(
		assistance: Array<{ student: string; assist: boolean }>,
		idSection: string,
		date?: string,
	) {
		await this.fetch.fetchData({
			method: 'post',
			URL: `/api/assistance/${idSection}`,
			token: this.authStore.getToken,
			body: {
				assistance,
				date,
			},
			abort: {
				url: 'same',
			},
		})
	}
}
