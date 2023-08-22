import { Service } from './service'
import { RecordTypes } from '~/models/assistance/record'
import { PresenceStatus } from '~/models/assistance/student'
import { BodyFetch } from '~~/models/body.model'
import { Student, Students } from '~~/models/user/student.model'
import { Voting } from '~~/models/voting/voting.model'
// Utils
import { formateDateInput } from '~~/utils/format'
import validator from '~~/utils/validator'

export class StudentsService extends Service {
	private readonly LIMIT = 30

	async getStudents(
		total = false,
		skip?: number,
		search?: string,
		actived?: boolean,
		filter?: Array<string>,
	) {
		let URL = `/api/students/get_students?total=${total}&limit=${this.LIMIT}`
		if (actived) URL += `&actived=${actived}`
		if (search) URL += `&search=${search}`
		if (skip && skip >= 0) URL += `&skip=${skip}`
		if (filter) URL += `&filter=${filter}`
		const data = await this.fetch<BodyFetch<Students>>({
			spinnerStatus: true,
			URL,
			method: 'get',
			abort: {
				url: 'same',
			},
		})
		return data.body
	}

	async getStudent(idStudent: string) {
		const dataFetch = await this.fetch<
			BodyFetch<{
				student: Student
			}>
		>({
			spinnerStatus: true,
			URL: `/api/students/${idStudent}`,
			method: 'get',
		})

		return dataFetch.body.student
	}

	async getStudentPresenceStatus(idStudent: string) {
		return await this.fetch<
			BodyFetch<{
				status: {
					status: keyof typeof PresenceStatus
					org: keyof typeof RecordTypes
				}
			}>
		>({
			method: 'get',
			URL: `/api/students/${idStudent}/presence_status`,
		}).then(({ body }) => body.status)
	}

	async getRegistrationTypes() {
		const dataFetch = await this.fetch<
			BodyFetch<{
				types: Array<{ value: string; text: string }>
			}>
		>({
			method: 'get',
			URL: '/api/students/registration/types',
		})

		return dataFetch.body.types
	}

	private validatorsStudent(
		student:
			| Student
			| (Omit<
					Omit<Omit<Omit<Student, '_id'>, 'user_type'>, 'course'>,
					'registration'
			  > & {
					course: string
			  }),
	) {
		if (student.name === '' || student.name.length > 100)
			throw new Error('Debe existir un nombre de máx. 100 carac.')
		const names = student.name.trim().split(' ').length
		if (names !== 2)
			throw new Error('Debe registrar los dos nombres del estudiante')
		if (
			student.first_lastname === '' ||
			student.first_lastname.length > 100
		)
			throw new Error(
				'Debe existir un apellido paterno de máx. 100 carac.',
			)
		if (
			student.second_lastname === '' ||
			student.second_lastname.length > 100
		)
			throw new Error(
				'Debe existir un apellido materno de máx. 100 carac.',
			)
		if (student.rut.length < 10 || !validator.rutValidator(student.rut))
			throw new Error(
				'Debe existir un RUT en formato 12345678-9 (Mín. 10 carac.)',
			)
		if (student.gender !== 'h' && student.gender !== 'm')
			throw new Error('Debe seleccionar un sexo para el estudiante')
		if (student.birthday === '')
			throw new Error('Debe indicar la fecha de nacimiento del alumno')
		if (
			student.registration_number === '' ||
			(student.registration_number as string).length > 100
		)
			throw new Error('Debe existir una matricula')
		if (
			student.course !== '' &&
			(!student.number_of_list ||
				student.number_of_list === '' ||
				(student.number_of_list?.length ?? 0) > 100)
		)
			throw new Error('Debe existir un número de lista')
	}

	async uploadStudent(
		student: Omit<
			Omit<Omit<Omit<Student, '_id'>, 'user_type'>, 'course'>,
			'registration'
		> & {
			course: string
		},
	) {
		try {
			this.validatorsStudent(student)
			const dataFetch = await this.fetch<
				BodyFetch<{
					student: Student
				}>
			>({
				method: 'post',
				URL: '/api/students/new_student',
				body: {
					...student,
					name: student.name.trim(),
					course: student.course !== '' ? student.course : undefined,
					number_of_list:
						student.number_of_list !== ''
							? student.number_of_list
							: undefined,
				},
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha agregado el estudiante exitosamente',
				type: 'success',
			})

			return dataFetch.body.student
		} catch (err) {
			this.addErrorToast(err)
		}
	}

	async uploadStudents(
		students: Array<
			Omit<Omit<Omit<Student, '_id'>, 'user_type'>, 'course'> & {
				course: string
			}
		>,
	) {
		try {
			for (const student of students) this.validatorsStudent(student)
			await this.fetch({
				method: 'post',
				URL: '/api/students/new_students',
				body: students.map((student) => ({
					...student,
					course: student.course !== '' ? student.course : undefined,
				})),
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se han agregado los estudiantes exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	async editStudent(student: Student, course: string) {
		try {
			this.validatorsStudent(student)
			await this.fetch({
				method: 'put',
				URL: `/api/students/edit_student/${student._id}`,
				body: {
					...student,
					course: course !== '' ? course : undefined,
				},
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha editado con éxito el estudiante',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	async updateRegistration(
		idStudent: string,
		registration: { type: string; file: File | null },
	) {
		try {
			validators(
				{
					type: {
						type: 'string',
						custom_name: 'Matrícula',
						min: 1,
					},
				},
				registration,
			)
			// FormData
			const formData = new FormData()

			formData.set('type', registration.type)
			if (registration.file)
				formData.set('file', registration.file as File)

			const dataFetch = await this.fetch<
				BodyFetch<{ file: string | null }>
			>({
				method: 'put',
				URL: `/api/students/${idStudent}/registration`,
				body: formData,
			})

			this.addToast({
				message:
					'Se ha actualizado el estado del estudiante exitosamente',
				type: 'success',
			})
			return dataFetch.body.file
		} catch (err) {
			this.addErrorToast(err)
		}
	}

	async changeStatus(why: string, idStudent: string) {
		try {
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')
			await this.fetch({
				method: 'post',
				URL: `/api/students/change_status/${idStudent}`,
				body: { why },
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha cambiado el estado del estudiante exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	// Voting
	async getVoting() {
		const dataFetch = await this.fetch<
			BodyFetch<{
				voting: Voting | null
			}>
		>({
			method: 'get',
			URL: '/api/students/get_voting',
			spinnerStatus: true,
		})
		return dataFetch.body.voting
			? {
					...dataFetch.body.voting,
					start_date: formateDateInput(
						dataFetch.body.voting.start_date,
					),
					finish_date: formateDateInput(
						dataFetch.body.voting.finish_date,
					),
			  }
			: null
	}

	async getStudentVote() {
		const dataFetch = await this.fetch<
			BodyFetch<{
				my_vote: boolean | null
			}>
		>({
			method: 'get',
			spinnerStatus: true,
			URL: '/api/students/get_my_vote',
		})
		return dataFetch.body.my_vote
	}

	async voteForList(vote: string) {
		try {
			if (vote === '')
				throw new Error('Debe seleccionar una lista a votar')
			await this.fetch({
				method: 'post',
				URL: `/api/students/vote/${vote}`,
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha votado satisfactoriamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	async uploadVoting(voting: {
		start_date: string
		finish_date: string
		period: string
		lists: Array<{
			list_name: string
			students: Array<{
				_id: string
				rol: string
			}>
		}>
	}) {
		try {
			await this.fetch({
				method: 'post',
				URL: '/api/students/upload_voting',
				body: voting,
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se han subido las votaciones exitosamente',
				type: 'success',
			})
			// Composable
			const votingComposable = useVoting()
			votingComposable.value = 'uploaded'

			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	async updateVoting(voting: {
		start_date: string
		finish_date: string
		period: number
		lists: Array<{
			list_name: string
			students: Array<{
				_id: string
				rol: string
			}>
		}>
	}) {
		try {
			await this.fetch({
				method: 'put',
				URL: '/api/students/edit_voting',
				body: voting,
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha actualizado las votaciones exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}
}
