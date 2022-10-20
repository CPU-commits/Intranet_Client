import { DefaultResponse } from "~~/common/fetchModule"
import { BodyFetch } from "~~/models/body.model"
import { NotificationType } from "~~/models/notification/notification.model"

export class NotificationsService {
    private readonly authStore = useAuthStore()
    private readonly toastStore = useToastsStore()
    private readonly nuxtApp = useNuxtApp()

    async getNotifications(total = false, skip = 0) {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            notifications: Array<NotificationType>
                total: number
            }> & DefaultResponse>({
            method: 'get',
            URL: `/api/notifications/get_notifications?skip=${skip}&total=${total}`,
            token: this.authStore.getToken,
            spinnerStatus: true,
        })

        return dataFetch.body
    }

    async getNotificationsCount() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            count: number
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/notifications/get_count_notifications`,
            token: this.authStore.getToken,
        })

        return dataFetch.body.count
    }

    async deleteNotification(idNotification: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'delete',
                URL: `/api/notifications/delete_notification/${idNotification}`,
                token: this.authStore.getToken,
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }
}
