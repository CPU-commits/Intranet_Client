import eslint from 'vite-plugin-eslint'
import { Logger } from './utils/logs'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	runtimeConfig: {
		iconURL: '',
		// Public
		public: {
			API: 'http://localhost:8080',
			NODE_ENV: 'dev' as 'dev' | 'prod',
			WS: 'localhost:7000',
			COLLEGE_NAME: 'School',
			SHORT_NAME: 'Sc',
			CLIENT_URL: 'https://example.com',
		},
		session: {
			session: {
				storageOptions: {
					driver: 'memory',
				},
			},
		},
		pwa: {
			manifest: {
				name: `${process.env.COLLEGE_NAME} Intranet`,
				short_name: `${process.env.COLLEGE_SHORT_NAME} Intr.`,
				description: `Intranet del colegio ${process.env.COLLEGE_NAME}`,
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
		'@vite-pwa/nuxt',
		'@pinia/nuxt',
		'nuxt-security',
		'@sidebase/nuxt-session',
		'nuxt-jsonld',
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
				driver: 'memory',
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
	app: {
		head: {
			title: 'Intranet',
			htmlAttrs: {
				lang: 'es',
			},
			link: [
				{
					rel: 'icon',
					type: 'image/png',
					href: '/icon.png',
				},
				{
					rel: 'apple-touch-icon',
					href: '/icon.png',
					sizes: 'any',
				},
				{
					rel: 'mask-icon',
					href: '/icon.png',
					color: '#FFFFFF',
				},
			],
			meta: [
				{
					name: 'theme-color',
					content: '#5867e8',
				},
			],
		},
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
		includeAssets: ['icon.png'],
		manifest: {
			name: `Intranet`,
			short_name: `Intr.`,
			description: `Intranet de Colegio`,
			theme_color: '#5867e8',
			background_color: '#f8faff',
			lang: 'es',
			icons: [
				{
					src: 'icon.png',
					sizes: '192x192',
					type: 'image/png',
				},
				{
					src: 'icon.png',
					sizes: '512x512',
					type: 'image/png',
				},
			],
		},
		strategies: 'generateSW',
		registerType: 'autoUpdate',
		workbox: {
			globPatterns: ['**/*.{js,css,ico,png,svg}'],
			navigateFallback: null,
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
