export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuthStore()

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
