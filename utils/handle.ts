export function handleErrorMessage(message: string, state = 500) {
	if (!message.startsWith('Fetch') && !message.startsWith('fetch'))
		return message
	if (state === 400) return 'Ups... Parece que algo se olvidó'
	if (state === 401) return 'No estás autorizado a esta ruta'
	if (state === 403) return 'Algo a alguien se le olvidó'
	if (state === 404) return 'Esta ruta no existe'
	if (state === 406) return '¡Alto! No se puede hacer eso aquí'
	if (state === 408)
		return '¡Lo sentimos! Tu o nuestra conexión necesita una taza de café'
	if (state === 409)
		return '¡Ups! Esto está como drama de telenovela. Tenemos un conflicto aquí'
	if (state === 410) return 'Este recurso se fue para siempre'
	if (state === 413) return 'El recurso que tratas de envíar es muy pesado'
	if (state === 429)
		return 'Hay que parar de hacer F5. Pero por ahora, por favor, espera un momento'
	if (state === 502)
		return 'La puerta a Narnia está cerrada en estos momentos. Por favor, intenta más tarde'
	if (state === 503)
		return 'Estamos fuera de servicio. Vuelva más tarde mientras lo habilitamos'
	return 'Algo explotó en el sótano... No te preocupes, llamamos a los especialistas en desastres'
}
