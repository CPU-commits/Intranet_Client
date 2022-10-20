export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuthStore()

    if (!auth.getIsAuth)
        return abortNavigation({
            statusCode: 401,
            message: 'No estás autenticado',
            statusMessage: 'Sin autenticación',
        })
    const roles = to.meta.roles
    if (roles instanceof Array) {
        if (!roles.some((r) => r === auth.getUserType))
            return abortNavigation({
                statusCode: 401,
                message: 'No estás autorizado a esta ruta',
            })
        return
    } else {
        return abortNavigation({
            statusCode: 506,
            message: 'meta.roles no es válido',
        })
    }
})
