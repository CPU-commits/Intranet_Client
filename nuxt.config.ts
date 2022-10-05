// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            API: 'http://localhost:8080',
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
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "@/assets/scss/_variables.scss" as *;',
                },
            },
        },
    },
})
