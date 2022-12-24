import eslint from 'vite-plugin-eslint'
import { Logger } from './utils/logs'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	runtimeConfig: {
		// Public
		public: {
			API: 'http://localhost:8080',
			NODE_ENV: 'dev' as 'dev' | 'prod',
			WS: 'localhost:7000',
			COLLEGE_NAME: 'School',
		},
		session: {
			session: {
				storageOptions: {
					options: {
						username:
							process.env
								.NUXT_SESSION_SESSION_STORAGE_OPTIONS_OPTIONS_USERNAME,
						password:
							process.env
								.NUXT_SESSION_SESSION_STORAGE_OPTIONS_OPTIONS_PASSWORD,
						host: process.env
							.NUXT_SESSION_SESSION_STORAGE_OPTIONS_OPTIONS_HOST,
						port: parseInt(
							process.env
								.NUXT_SESSION_SESSION_STORAGE_OPTIONS_OPTIONS_PORT ??
								'6379',
							10,
						),
					},
				},
			},
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
	css: ['@/assets/scss/main.scss'],
	modules: [
		'@nuxt/image-edge',
		'@nuxt/content',
		'@kevinmarrec/nuxt-pwa',
		'@pinia/nuxt',
		'nuxt-security',
		'@sidebase/nuxt-session',
		// '@nuxtjs/html-validator',
		// '@nuxtjs/web-vitals' -> Integrate GA and party town -> https://github.com/nuxt-modules/partytown
	],
	image: {
		domains: ['*.s3.amazonaws.com'],
	},
	imports: {
		dirs: ['stores'],
	},
	session: {
		isEnabled: true,
		session: {
			cookieSameSite: 'strict',
			storageOptions: {
				driver: 'redis',
				options: {
					base: '',
					username: 'default',
					password: 'MDNcVb924a',
					host: 'localhost',
					port: 6379,
				},
			},
			expiryInSeconds: 60 * 60,
		},
		api: {
			isEnabled: true,
		},
	},
	ssr: true,
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData:
						'@use "@/assets/scss/_variables.scss" as *;',
				},
			},
		},
		plugins: [eslint()],
	},
	hooks: {
		ready(nuxt) {
			const logger = new Logger()
			logger.info({
				message: `Ready nuxt app ${nuxt._version}`,
				context: 'nuxt:app',
				labels: ['init', 'server', 'client'],
			})
		},
		listen() {
			const logger = new Logger()
			logger.info({
				message: 'Listen nuxt app on port 3000',
				context: 'nuxt:app',
				labels: ['init', 'server', 'client'],
			})
		},
		close() {
			const logger = new Logger()
			logger.warn({
				message: 'Nuxt app stopped',
				context: 'nuxt:app',
				labels: ['init', 'server', 'client'],
			})
		},
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
	security: {
		rateLimiter: {
			value: {
				tokensPerInterval: 150,
				interval: 'hour',
				fireImmediately: false,
			},
			route: '/**',
		},
		headers: {
			contentSecurityPolicy: {
				// img-src * 'self' data: https:
				value: "base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src * 'self' data: https:;object-src 'none';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
				route: '/**',
			},
			crossOriginEmbedderPolicy: {
				value: 'unsafe-none',
				route: '/**',
			},
		},
		allowedMethodsRestricter: {
			value: ['GET', 'POST'],
			route: '/**',
		},
	},
})
