import { Service } from './service'
import { DefaultResponse } from '~~/common/fetchModule'
import { BodyFetch } from '~~/models/body.model'
import { Specialty } from '~~/models/subject/specialty.model'
import { Subject } from '~~/models/subject/subject.model'

export class SubjectService extends Service {
	async getSubjects() {
		const dataFetch = await this.fetch<
			BodyFetch<{
				subjects: Array<Subject>
			}>
		>({
			method: 'get',
			URL: '/api/subjects/get_subjects',
			spinnerStatus: true,
		})
		return dataFetch.body.subjects
	}

	async getCourseSubjects(idCourse: string) {
		const dataFetch = await this.fetch<
			BodyFetch<{ subjects: Array<Subject> }>
		>({
			method: 'get',
			URL: `/api/subjects/course/${idCourse}`,
			spinnerStatus: true,
		})

		return dataFetch.body.subjects
	}

	async getSpecialties() {
		const dataFetch = await this.fetch<
			BodyFetch<{
				specialties: Array<Specialty>
			}>
		>({
			URL: '/api/subjects/get_specialties',
			method: 'get',
			spinnerStatus: true,
		})
		return dataFetch.body.specialties
	}

	// Specialty
	async newSpecialty(specialty: string) {
		try {
			if (specialty === '' || specialty.length > 100)
				throw new Error(
					'Debe existir una especialidad de máx. 100 cárac.',
				)
			const dataFetch = await this.fetch<
				BodyFetch<{
					specialty: Specialty
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/subjects/new_specialty',
				body: { specialty },
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha agregado la especialidad exitosamente',
				type: 'success',
			})
			return dataFetch.body.specialty
		} catch (err) {
			this.addErrorToast(err)
		}
	}

	async deleteSpecialty(idSpecialty: string) {
		try {
			await this.fetch({
				method: 'delete',
				URL: `/api/subjects/delete_specialty/${idSpecialty}`,
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha eliminado la especialidad exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	// Subjects
	async newSubject(subject: { subject: string; specialty: string }) {
		try {
			if (subject.subject === '' || subject.subject.length > 100)
				throw new Error('Debe existir una materia de máx. 100 cárac.')
			const dataFetch = await this.fetch<
				BodyFetch<{
					subject: Subject
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/subjects/new_subject',
				body: {
					subject: subject.subject,
					specialty:
						subject.specialty === ''
							? undefined
							: subject.specialty,
				},
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha agregado la especialidad exitosamente',
				type: 'success',
			})

			return dataFetch.body.subject
		} catch (err) {
			this.addErrorToast(err)
		}
	}

	async deleteSubject(idSubject: string) {
		try {
			await this.fetch({
				method: 'delete',
				URL: `/api/subjects/delete_subject/${idSubject}`,
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha eliminado la materia exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	// Anchor
	async addSubject(subjectAnchor: string, idCourse: string) {
		try {
			if (subjectAnchor === '')
				throw new Error(
					'Debe seleccionar una materia que anclar al curso',
				)
			const dataFetch = await this.fetch<
				BodyFetch<{
					subject: Subject
				}> &
					DefaultResponse
			>({
				method: 'post',
				URL: '/api/subjects/add_subject',
				body: {
					course: idCourse,
					subject: subjectAnchor,
				},
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha anclado la materia al curso exitosamente',
				type: 'success',
			})

			return dataFetch.body.subject
		} catch (err) {
			this.addErrorToast(err)
		}
	}

	async deleteSubjectCourse(idSubject: string, idCourse: string) {
		try {
			await this.fetch({
				method: 'delete',
				URL: `/api/subjects/delete_subject_course/${idSubject}/${idCourse}`,
				spinnerStatus: true,
			})
			this.addToast({
				message:
					'Se ha eliminado el anclaje de la materia al curso exitosamente',
				type: 'success',
			})

			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}
}
