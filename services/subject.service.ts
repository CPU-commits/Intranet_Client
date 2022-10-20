import { DefaultResponse } from "~~/common/fetchModule"
import { BodyFetch } from "~~/models/body.model"
import { Specialty } from "~~/models/subject/specialty.model"
import { Subject } from "~~/models/subject/subject.model"

export class SubjectService {
    private readonly authStore = useAuthStore()
    private readonly toastsStore = useToastsStore()
    private readonly nuxtApp = useNuxtApp()

    async getSubjects() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            subjects: Array<Subject>
        }> & DefaultResponse>({
            method: 'get',
            URL: '/api/subjects/get_subjects',
            token: this.authStore.getToken,
            spinnerStatus: true,
        })
        return dataFetch.body.subjects
    }

    async getSpecialties() {
        const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
            specialties: Array<Specialty>
        }> & DefaultResponse>({
            URL: '/api/subjects/get_specialties',
            method: 'get',
            token: this.authStore.getToken,
            spinnerStatus: true,
        })
        return dataFetch.body.specialties
    }

    // Specialty
    async newSpecialty(specialty: string) {
        try {
            if (specialty === '' || specialty.length > 100)
                throw new Error('Debe existir una especialidad de máx. 100 cárac.')
            const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
                specialty: Specialty
            }> & DefaultResponse>({
                method: 'post',
                URL: '/api/subjects/new_specialty',
                body: { specialty },
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastsStore.addToast({
                message: 'Se ha agregado la especialidad exitosamente',
                type: 'success',
            })
            return dataFetch.body.specialty
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastsStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }

    async deleteSpecialty(idSpecialty: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'delete',
                URL: `/api/subjects/delete_specialty/${idSpecialty}`,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastsStore.addToast({
                message: 'Se ha eliminado la especialidad exitosamente',
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
    // Subjects
    async newSubject(subject: { subject: string, specialty: string }) {
        try {
            if (subject.subject === '' || subject.subject.length > 100)
                throw new Error('Debe existir una materia de máx. 100 cárac.')
            const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
                subject: Subject
            }> & DefaultResponse>({
                method: 'post',
                URL: '/api/subjects/new_subject',
                body: {
                    subject: subject.subject,
                    specialty: subject.specialty === '' ? undefined : subject.specialty,
                },
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastsStore.addToast({
                message: 'Se ha agregado la especialidad exitosamente',
                type: 'success',
            })

            return dataFetch.body.subject
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastsStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }

    async deleteSubject(idSubject: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'delete',
                URL: `/api/subjects/delete_subject/${idSubject}`,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastsStore.addToast({
                message: 'Se ha eliminado la materia exitosamente',
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
    // Anchor
    async addSubject(subjectAnchor: string, idCourse: string) {
        try {
            if (subjectAnchor === '')
                throw new Error('Debe seleccionar una materia que anclar al curso')
            const dataFetch = await this.nuxtApp.$fetchModule.fetchData<BodyFetch<{
                subject: Subject
            }> & DefaultResponse>({
                method: 'post',
                URL: '/api/subjects/add_subject',
                body: {
                    course: idCourse,
                    subject: subjectAnchor,
                },
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastsStore.addToast({
                message: 'Se ha anclado la materia al curso exitosamente',
                type: 'success',
            })

            return dataFetch.body.subject
        } catch (err) {
            const _err = this.nuxtApp.$fetchModule.handleError(err)
            this.toastsStore.addToast({
                message: _err.message,
                type: 'error',
            })
        }
    }

    async deleteSubjectCourse(idSubject: string, idCourse: string) {
        try {
            await this.nuxtApp.$fetchModule.fetchData({
                method: 'delete',
                URL: `/api/subjects/delete_subject_course/${idSubject}/${idCourse}`,
                spinnerStatus: true,
                token: this.authStore.getToken,
            })
            this.toastsStore.addToast({
                message: 'Se ha eliminado el anclaje de la materia al curso exitosamente',
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
