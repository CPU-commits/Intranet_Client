// Types
import { Service } from './service'
import { Address } from '~/models/address/address'
import { Parent } from '~/models/user/parent.model'
import type { BodyFetch } from '~~/models/body.model'
import { User } from '~~/models/user/user.model'

export class ParentService extends Service {
	private readonly LIMIT = 30

	async getParents(total = false, skip?: number, search?: string) {
		let URL = `/api/parents?total=${total}&limit=${this.LIMIT}`
		if (search) URL += `&search=${search}`
		if (skip && skip >= 0) URL += `&skip=${skip}`
		const data = await this.fetch<
			BodyFetch<{ parents: Array<Parent>; total?: number }>
		>({
			URL,
			spinnerStatus: true,
			method: 'get',
			abort: {
				url: 'same',
			},
			scopeSpinner: 'parent_students',
		})
		return data.body
	}

	async getParentStudent() {
		const dataFetch = await this.fetch<
			BodyFetch<{ students: Array<User> }>
		>({
			URL: `/api/parents/students`,
			method: 'get',
			spinnerStatus: true,
			abort: {
				url: 'same',
			},
		})

		return dataFetch.body.students
	}

	async getParentsByStudentID(idStudent: string) {
		return await this.fetch<BodyFetch<{ parents: Array<Parent> }>>({
			method: 'get',
			URL: `/api/parents/student/${idStudent}`,
		}).then(({ body }) => body.parents)
	}

	async getParentStudentsByID(idParent: string) {
		const dataFetch = await this.fetch<
			BodyFetch<{ students: Array<User> }>
		>({
			URL: `/api/parents/${idParent}/students`,
			method: 'get',
			spinnerStatus: true,
			abort: {
				url: 'same',
			},
		})

		return dataFetch.body.students
	}

	async changeStatus(why: string, idParent: string) {
		try {
			if (why.length > 535 || why === '')
				throw new Error('Debe existir un motivo de máx 535 cárac.')

			await this.fetch({
				method: 'post',
				URL: `/api/parents/status/${idParent}`,
				body: { why },
				spinnerStatus: true,
			})

			this.addToast({
				message: 'Se ha cambiado el estado del apoderado exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	private validatorsParent(formParent: User) {
		validators(
			{
				name: {
					type: 'string',
					custom_name: 'Nombre',
					min: 1,
					max: 100,
				},
				first_lastname: {
					type: 'string',
					custom_name: 'Apellido Paterno',
					min: 1,
					max: 100,
				},
				second_lastname: {
					type: 'string',
					custom_name: 'Apellido Materno',
					min: 1,
					max: 100,
				},
				gender: {
					type: 'string',
					custom_name: 'Sexo',
					min: 1,
				},
				birthday: {
					type: 'string',
					custom_name: 'Fecha de nacimiento',
					min: 1,
				},
				address: {
					type: 'address',
					custom_name: 'Dirección',
				},
				phone: {
					type: 'string',
					custom_name: 'Telefóno',
					min: 1,
				},
				email: {
					type: 'string',
					custom_name: 'Email',
					min: 1,
					is_email: true,
				},
				rut: {
					type: 'string',
					custom_name: 'RUT',
					min: 1,
					is_rut: true,
				},
			},
			formParent,
		)
	}

	async uploadParent(parent: User & { address: Address }) {
		try {
			this.validatorsParent(parent)
			const dataFetch = await this.fetch<
				BodyFetch<{
					parents: Parent
				}>
			>({
				method: 'post',
				URL: '/api/parents',
				body: [parent],
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha agregado el apoderado exitosamente',
				type: 'success',
			})

			return dataFetch.body.parents
		} catch (err) {
			this.addErrorToast(err)
		}
	}

	async uploadParents(parents: Array<User>) {
		try {
			for (const parent of parents) this.validatorsParent(parent)
			await this.fetch({
				method: 'post',
				URL: '/api/parents',
				body: parents,
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se han agregado los apoderados exitosamente',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}

	async assignStudent(idParent: string, idStudent: string) {
		try {
			const dataFetch = await this.fetch<BodyFetch<{ student: User }>>({
				method: 'put',
				URL: `/api/parents/${idParent}/students`,
				body: {
					idStudent,
				},
				spinnerStatus: true,
			})
			this.addToast({
				message: 'Se ha asignado el alumno exitosamente',
				type: 'success',
			})

			return dataFetch.body.student
		} catch (err) {
			this.addErrorToast(err)
			return null
		}
	}

	async editParent(parent: User, idParent: string) {
		try {
			this.validatorsParent(parent)
			await this.fetch({
				method: 'put',
				URL: `/api/parents/${idParent}`,
				spinnerStatus: true,
				body: parent,
			})
			this.addToast({
				message: 'Se ha editado con éxito el apoderado',
				type: 'success',
			})
			return true
		} catch (err) {
			this.addErrorToast(err)
			return false
		}
	}
}
