// Types
import type { DefaultResponse } from "~~/common/fetchModule"
import type { BodyFetch } from "~~/models/body.model"
import type { History } from "~~/models/history/history.model"
import { User } from "~~/models/user/user.model"

export class HistoryService {
    private readonly authStore = useAuthStore()
    private readonly toastStore = useToastsStore()
    private readonly nuxtApp = useNuxtApp()

    async getHistory(total = false, limit = 30, skip = 0, extraQueryParams?: string) {
        let query = `?total=${total}&skip=${skip}&limit=${limit}`
        if (extraQueryParams) query += extraQueryParams

        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            history: {
                history: Array<History>
                total: number
            }
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/history/get_history${query}`,
            spinnerStatus: true,
            token: this.authStore.getToken,
        })
        return dataFetch.body.history
    }

    async getPersons() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            persons: Array<User>
        }> & DefaultResponse>({
            method: 'get',
            URL: '/api/users/get_persons_history',
            spinnerStatus: true,
            token: this.authStore.getToken,
        })
        return dataFetch.body.persons
    }
}
