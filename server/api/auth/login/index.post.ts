// Fetch
import { DefaultResponse } from "~~/common/fetchModule"
// Server
import { cookieConfig, setCookieSession } from "~~/server/common/cookie"
// Types
import { validateBody, Type } from 'h3-typebox'
import type { AuthData } from "~~/stores/useAuthStore"

export default defineEventHandler(async (event) => {
    try {
        const body = await validateBody(event, Type.Object({
            rut: Type.String(),
            password: Type.String(),
        }))
        // Get authData
        const dataFetch = await $fetch<AuthData & DefaultResponse>('api/authentication', {
            body,
            method: 'post',
            baseURL: useRuntimeConfig().public.API,
        })
        // Set session in Redis
        const idSession = await setCookieSession(dataFetch)
        // Set cookie
        setCookie(event, 'INT_SESSION', idSession, cookieConfig(0))
        // Return response
        return dataFetch
    } catch (err) {
        throw createError(err as Error)
    }
})
