// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    runtimeConfig: {
        // Redis Config
        redisUser: '',
        redisPassword: '',
        redisHost: '',
        redisPort: 0,
        // Public
        public: {
            API: 'http://localhost:8080',
            NODE_ENV: 'dev' as 'dev' | 'prod',
        },
    },
    typescript: {
        strict: true,
        typeCheck: true,
    },
    css: ["@/assets/scss/main.scss"],
    modules: [
        '@pinia/nuxt',
    ],
    imports: {
        dirs: ['stores'],
    },
    ssr: true,
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "@/assets/scss/_variables.scss" as *;',
                },
            },
        },
    },
    head: {
        htmlAttrs: {
            lang: 'es',
        },
    },
})
