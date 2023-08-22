// Types
import { Hierarchy } from '~/models/college/hierarchy.model'
import {
	HierarchyData,
	HierarchyLevel,
} from '~/models/college/hierarchy_data.model'
import { DefaultResponse, Fetch } from '~~/common/fetchModule'
import type { BodyFetch } from '~~/models/body.model'

export class CollegeService {
	private readonly authStore = useAuthStore()
	private readonly toastsStore = useToastsStore()
	private readonly fetch: Fetch
	private readonly router = useRouter()

	constructor(fetch: Fetch) {
		this.fetch = fetch
	}

	async getCollege() {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				college: {
					direction: string
					phone: string
					email: string
				}
			}> &
				DefaultResponse
		>({
			method: 'get',
			URL: `/api/college/get_college_data`,
			spinnerStatus: true,
			token: this.authStore.getToken,
		})
		return dataFetch.body.college
	}

	async getHierarchy() {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{ hierarchy: Hierarchy }>
		>({
			method: 'get',
			URL: '/api/hierarchy',
			token: this.authStore.getToken,
		})

		return dataFetch.body.hierarchy
	}

	async getRegisteredHierarchies() {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{ hierarchy: Array<HierarchyData> }>
		>({
			method: 'get',
			URL: '/api/hierarchy/registered',
			token: this.authStore.getToken,
		})

		return dataFetch.body.hierarchy
	}

	async getRegisteredTec(course?: string, modality?: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{ tec: Array<string> }>
		>({
			method: 'get',
			token: this.authStore.getToken,
			URL: '/api/hierarchy/registered/tec',
			params: {
				modality,
				course,
			},
		})

		return dataFetch.body.tec
	}

	async getRegisteredGrades(used = true) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				grades: Array<{
					key: string
					level: string
					specialty: string | null
					value: string
				}>
			}>
		>({
			method: 'get',
			URL: '/api/hierarchy/registered/grades',
			token: this.authStore.getToken,
			params: {
				used,
			},
		})

		return dataFetch.body.grades
	}

	async getRegisteredHierarchy(idHierarchy: string) {
		const dataFetch = await this.fetch.fetchData<
			BodyFetch<{
				hierarchy: HierarchyData & {
					schedule_key: string
					modality_key: string
				}
			}>
		>({
			method: 'get',
			URL: `/api/hierarchy/registered/${idHierarchy}`,
			token: this.authStore.getToken,
		})

		return dataFetch.body.hierarchy
	}

	async addGrades(levels: Array<HierarchyLevel>, idHierarchy: string) {
		try {
			await this.fetch.fetchData({
				method: 'put',
				URL: `/api/hierarchy/levels/${idHierarchy}`,
				body: levels,
				token: this.authStore.getToken,
			})

			return true
		} catch (err) {
			const error = this.fetch.handleError(err)

			this.toastsStore.addToast({
				message: error.message,
				type: 'error',
			})
			return false
		}
	}

	async deleteGrade(grade: string, idHierarchy: string) {
		try {
			await this.fetch.fetchData({
				method: 'delete',
				URL: `/api/hierarchy/${idHierarchy}/grades`,
				body: {
					grade,
				},
				token: this.authStore.getToken,
			})

			return true
		} catch (err) {
			const error = this.fetch.handleError(err)

			this.toastsStore.addToast({
				message: error.message,
				type: 'error',
			})
			return false
		}
	}

	async uploadCollegeData(college: {
		direction: string
		phone: string
		email: string
	}) {
		try {
			if (
				college.direction === '' ||
				college.email === '' ||
				college.phone === ''
			)
				throw new Error('Todos los campos deben ser rellenados')
			await this.fetch.fetchData({
				method: 'post',
				URL: '/api/college/update_college',
				body: college,
				token: this.authStore.getToken,
				spinnerStatus: true,
			})
			this.toastsStore.addToast({
				message:
					'Se ha actualizado la información del colegio exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			const _err = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: _err.message,
				type: 'error',
			})
			return false
		}
	}

	async uploadHierarchy(hierarchy: HierarchyData) {
		try {
			await this.fetch.fetchData({
				method: 'post',
				URL: '/api/hierarchy',
				token: this.authStore.getToken,
				body: hierarchy,
			})

			this.toastsStore.addToast({
				message: 'Se ha subido la jerarquía exitosamente',
				type: 'success',
			})
			this.router.push('/admin/colegio')
		} catch (err) {
			const error = this.fetch.handleError(err)
			this.toastsStore.addToast({
				message: error.message,
				type: 'error',
			})
		}
	}
}
