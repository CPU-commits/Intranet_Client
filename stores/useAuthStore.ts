import { defineStore } from 'pinia'
import { DefaultResponse } from '~~/common/fetchModule'
import { UserTypes } from '~~/models/user/user.model'
import { formatUserType } from '~~/utils/format'

type KeysUserTypes = keyof typeof UserTypes

export interface AuthData {
	access_token: string
	user: {
		_id: string
		name: string
		status: number
		user_type: KeysUserTypes
	}
}

async function logIn(userForm: { rut: string; password: string }) {
	const { $fetchModule } = useNuxtApp()
	const dataFetch = await $fetchModule.fetchData<AuthData & DefaultResponse>({
		method: 'post',
		URL: '/api/auth/login',
		body: userForm,
		nuxt: true,
	})
	return dataFetch
}

async function logOut() {
	const { $fetchModule } = useNuxtApp()
	await $fetchModule.fetchData({
		method: 'post',
		URL: '/api/auth/close_session',
		spinnerStatus: true,
		nuxt: true,
	})
}

const useAuthStore = defineStore('auth', {
	state: () => ({
		isAuth: false,
		user: null as AuthData | null,
	}),
	getters: {
		getIsAuth(state) {
			return state.isAuth
		},
		getUser(state): AuthData | null {
			return state.user
		},
		getToken(state): string | null {
			return state.user?.access_token ?? null
		},
		getUserType(state): KeysUserTypes | null {
			return state.user?.user.user_type ?? null
		},
		getName(state): string | null {
			return state.user?.user.name ?? null
		},
		getID(state): string | null {
			return state.user?.user._id ?? null
		},
		getUserTypeName(state) {
			if (!state.user?.user.user_type) return ''
			return formatUserType(state.user?.user.user_type)
		},
	},
	actions: {
		unsetAuth() {
			this.isAuth = false
			this.user = null
		},
		async logIn(userForm: { rut: string; password: string }) {
			const dataFetch = await logIn(userForm)
			this.setAuth({
				user: dataFetch.user,
				access_token: dataFetch.access_token,
			})
		},
		async logOut() {
			await logOut()
			this.unsetAuth()
		},
		setAuth(user: AuthData) {
			this.isAuth = true
			this.user = user
		},
		userTypeNotIs(...userTypes: KeysUserTypes[]) {
			return !userTypes.includes(this.getUserType as never)
		},
		userTypeIs(...userTypes: KeysUserTypes[]) {
			return userTypes.includes(this.getUserType as never)
		},
	},
})

export default useAuthStore
