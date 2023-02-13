import { SitemapStream, streamToPromise } from 'sitemap'
import { serverQueryContent } from '#content/server'

export default defineEventHandler(async (event) => {
	const runtimeConfig = useRuntimeConfig()
	const clientURL = runtimeConfig.public.CLIENT_URL
	// Fetch all documents
	const docs = await serverQueryContent(event).find()
	const sitemap = new SitemapStream({
		hostname: clientURL,
		xslUrl: `${clientURL}/sitemap.xml`,
	})
	// Add all documents
	for (const doc of docs) {
		sitemap.write({
			url: doc._path,
			changefreq: 'monthly',
			priority: 0.3,
		})
	}
	// Add /
	sitemap.write({
		url: '/',
		changefreq: 'monthly',
		priority: 0.9,
	})
	sitemap.end()

	return streamToPromise(sitemap)
})
