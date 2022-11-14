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
            WS: 'localhost:7000',
            COLLEGE_NAME: 'School',
        },
    },
    content: {
        watch: {
            ws: {
                port: 6174,
                hostname: 'localhost',
            },
        },
    },
    typescript: {
        strict: true,
        typeCheck: true,
    },
    css: [
        "@/assets/scss/main.scss",
    ],
    modules: [
        '@pinia/nuxt',
        '@nuxt/image-edge',
        '@nuxt/content',
        '@kevinmarrec/nuxt-pwa',
    ],
    image: {
        domains: ['*.s3.amazonaws.com'],
    },
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
    app: {
        head: {
            htmlAttrs: {
                lang: 'es',
            },
        },
    },
    render: {
        csp: true,
    },
    pwa: {
        manifest: {
            name: `${process.env.COLLEGE_NAME} Intranet`,
            short_name: `${process.env.COLLEGE_SHORT_NAME} Intr.`,
            description: `Intranet del colegio ${process.env.COLLEGE_NAME}`,
            theme_color: '#5867e8',
            background_color: '#f8faff',
            lang: 'es',
        },
    },
})
