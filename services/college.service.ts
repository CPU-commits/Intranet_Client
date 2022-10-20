// Types
import { DefaultResponse } from "~~/common/fetchModule"
import type { BodyFetch } from "~~/models/body.model"

export class CollegeService {
    private readonly authStore = useAuthStore()
    private readonly toastsStore = useToastsStore()
    private readonly nuxtApp = useNuxtApp()

    async getCollege() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            college: {
                direction: string
                phone: string
                email: string
            }
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/college/get_college_data`,
            spinnerStatus: true,
            token: this.authStore.getToken,
        })
        return dataFetch.body.college
    }

    async uploadCollegeData(college: { direction: string, phone: string, email: string }) {
        try {
            if (college.direction === '' || college.email === '' || college.phone === '')
                throw new Error('Todos los campos deben ser rellenados')
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'post',
                URL: '/api/college/update_college',
                body: college,
                token: this.authStore.getToken,
                spinnerStatus: true,
            })
            this.toastsStore.addToast({
                message: 'Se ha actualizado la información del colegio exitosamente',
                type: 'success',
            })
            return true
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastsStore.addToast({
                message: _err.message,
                type: 'error',
            })
            return false
        }
    }
}
