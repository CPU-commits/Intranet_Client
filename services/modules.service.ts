// Types
import type { DefaultResponse } from "~~/common/fetchModule"
import { BodyFetch } from "~~/models/body.model"
import type { GradeProgram } from "~~/models/classroom/grade.model"
import type { ClassroomModule, DirectiveModule } from "~~/models/classroom/modules.model"
import type { StudentGrade } from "~~/models/classroom/student_grade.model"
import { Hits } from "~~/models/es/hist.model"

export class ModulesService {
    private readonly authStore = useAuthStore()
    private readonly toastStore = useToastsStore()
    private readonly nuxtApp = useNuxtApp()
    private readonly LIMIT = 20

    async getModules() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<{
            body: { modules: Array<ClassroomModule> }
        } & DefaultResponse>({
            method: 'get',
            URL: `/api/classroom/get_modules`,
            token: this.authStore.getToken,
        })
        return dataFetch.body.modules
    }

    async getClassModules() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            modules?: Array<ClassroomModule>
        }> & DefaultResponse>({
            method: 'get',
            URL: '/api/c/classroom/modules/get_modules',
            spinnerStatus: true,
            token: this.authStore.getToken,
        })

        return dataFetch.body.modules ?? []
    }

    async getModulesHistory(total: boolean, skip: number = 0) {
        let query = `?limit=${this.LIMIT}`
        if (total) query += `&total=true`
        if (skip > 0) query += `&skip=${skip}`
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            modules?: Array<ClassroomModule>
            total: number
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/c/classroom/modules/get_modules_history${query}`,
            spinnerStatus: true,
            token: this.authStore.getToken,
        })

        return {
            modules: dataFetch.body.modules ?? [],
            total: dataFetch.body.total,
        }
    }

    async getModule(idModule: string) {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            module: ClassroomModule
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/c/classroom/modules/get_module/${idModule}`,
            spinnerStatus: false,
            token: this.authStore.getToken,
        })

        return dataFetch.body.module
    }

    async getModuleGrades(idModule: string) {
        const dataFetch = await Promise.all([
            this.nuxtApp.$fetchModule.fetchData<{
                body: {
                    students?: Array<StudentGrade>
                }
            } & DefaultResponse>({
                URL: `/api/c/classroom/grades/get_students_grades/${idModule}`,
                token: this.authStore.getToken,
                method: 'get',
                spinnerStatus: true,
            }),
            this.nuxtApp.$fetchModule.fetchData<{
                body: {
                    programs?: Array<GradeProgram>
                }
            } & DefaultResponse>({
                method: 'get',
                URL: `/api/c/classroom/grades/get_grade_programs/${idModule}`,
                token: this.authStore.getToken,
                spinnerStatus: true,
            }),
        ])
        return {
            grades: dataFetch[0].body.students ?? [],
            gradesProgram: dataFetch[1].body.programs ?? [],
        }
    }

    async getDirectivesModule(idModule: string) {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<{
            body: { directives: DirectiveModule }
        } & DefaultResponse>(
            {
                method: 'get',
                URL: `/api/classroom/directives/get_directive/${idModule}`,
                token: this.authStore.getToken,
                spinnerStatus: true,
            },
        )
        return dataFetch.body.directives
    }

    async getDirectivesStatus() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<{
            body: {
                directives: Array<{
                    module: string
                    status: boolean
                    messages: Array<string>
                }>
            }
        } & DefaultResponse>({
            method: 'get',
            URL: `/api/classroom/directives/get_directives_status`,
            spinnerStatus: true,
            token: this.authStore.getToken,
        })
        const directives = dataFetch.body.directives
        return directives.map((directive) => {
            return {
                ...directive,
                messages:
                    directive?.messages?.map((message): string => {
                        if (message === 'min_grades') return 'Cantidad mín. calificaciones'
                        if (message === 'all_grades')
                            return 'Todos los alumnos con todas las calificaciones programadas'
                        if (message === 'continuous')
                            return 'Calificaciones programadas continuas'
                        return ''
                    }) ?? [],
            }
        })
    }

    async search(idModule: string, search: string) {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            hits: Hits
        }> & DefaultResponse>({
            method: 'get',
            URL: `/api/c/classroom/modules/search/${idModule}?search=${search}`,
            spinnerStatus: true,
            token: this.authStore.getToken,
        })

        return dataFetch.body.hits
    }

    async addDirective(directives: Omit<DirectiveModule, 'module'>, idModule: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'post',
                URL: `/api/classroom/directives/add_directive/${idModule}`,
                body: directives,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastStore.addToast({
                message: 'Se han actualizado las directivas exitosamente',
                type: 'success',
            })
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }
    // Classroom
    async addSection(subSection: string, idModule: string) {
        try {
            const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
                inserted_id: string
            }> & DefaultResponse>({
                method: 'post',
                URL: `/api/c/classroom/modules/new_sub_section/${idModule}`,
                body: { sub_section: subSection },
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            return dataFetch.body.inserted_id
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }
}
