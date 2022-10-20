// Types
import type { FetchError } from 'ohmyfetch'

enum HTTPMethods {
    'post',
    'put',
    'get',
    'delete',
}

interface ConfigFetch {
    method: keyof typeof HTTPMethods
    URL: string
    body?: BodyInit | null | undefined | Record<string, any>
    spinnerStatus?: boolean
    headers?: HeadersInit
    token?: string | null
    nuxt?: boolean
    responseType?: 'blob' | 'text' | 'json' | 'stream' | 'arrayBuffer'
}

export type DefaultResponse = {
    success: boolean
    message?: string
}

export type ErrorFetch = {
    success: boolean
    message: string
    statusCode: number
}

export class Fetch {
    private publicApi: string | undefined
    private readonly spinner = useSpinner()

    private isFetchError(error: unknown): error is FetchError {
        return (
            typeof error === 'object' &&
            error !== null &&
            'message' in error
        )
    }

    handleError(error: unknown): ErrorFetch {
        if (this.isFetchError(error)) {
            return {
                success: false,
                message: error.data?.message ?? error.message,
                statusCode: error.response?.status ?? 500,
            }
        } else if (error instanceof Error) {
            return {
                success: false,
                message: error.message,
                statusCode: 500,
            }
        }
        return {
            success: false,
            message: 'Error inesperado',
            statusCode: 500,
        }
    }

    private getFetch({ method, body, nuxt, token, responseType }: ConfigFetch) {
        if (!this.publicApi) {
            const config = useRuntimeConfig()
            this.publicApi = config.public.API
        }
        return $fetch.create({
            baseURL: !nuxt ? this.publicApi : undefined,
            parseResponse: responseType === 'blob' ? undefined : JSON.parse,
            responseType: responseType,
            headers: {
                'Authorization': `Bearer ${token}` ?? '',
            },
            method,
            body,
            async onRequestError({ request, options, error }) {
                const spinner = useSpinner()
                // Log error
                console.log('[fetch request error]', request, error)
                // Spinner false
                spinner.value = false
            },
            async onResponseError({ request, response, options }) {
                const spinner = useSpinner()
                // Log response
                console.log('[fetch response error]', request, response.body)
                // Spinner false
                spinner.value = false
            },
            mode: 'cors',
        })
    }

    async fetchData<T extends DefaultResponse>(config: ConfigFetch): Promise<T> {
        const apiFetch = this.getFetch(config)

        this.spinner.value = config.spinnerStatus ?? false
        const dataFetch = await apiFetch<T & DefaultResponse>(config.URL)

        this.spinner.value = false
        return dataFetch as T & DefaultResponse
    }
}
