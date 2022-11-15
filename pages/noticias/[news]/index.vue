<script setup lang="ts">
// Types
import { News } from '~~/models/news/news.model'
// Meta
const schoolName = useRuntimeConfig().public.COLLEGE_NAME
const title = ref(schoolName
    ? `Noticia - ${schoolName} - Intranet`
    : 'Noticia - Intranet')
// Nuxtapp
const {
    $fetchModule,
    $newsService,
} = useNuxtApp()
// Router
const route = useRoute()

const idNews = route.params.news
if (typeof idNews !== 'string')
    throw createError({
        message: '[news] must be a string',
        statusCode: 400,
        fatal: true,
    })

const news = ref<News | null>(null)
try {
    news.value = await $newsService.getSingleNews(idNews)

    title.value = schoolName
        ? `${news.value.title} - ${schoolName} - Intranet`
        : `${news.value.title} - Intranet`
} catch (err) {
    const _err = $fetchModule.handleError(err)
    throw createError({
        ..._err,
        fatal: true,
    })
}
</script>

<template>
    <div>
        <!-- Head -->
        <Head>
            <Title>{{ title }}</Title>
            <Meta name="robots" content="noindex, nofollow" />
        </Head>
        <!-- Body -->
        <NewsRead v-if="news" :news="news" />
    </div>
</template>
