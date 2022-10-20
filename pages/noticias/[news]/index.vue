<script setup lang="ts">
// Types
import { News } from '~~/models/news/news.model'
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
    })

const news = ref<News | null>(null)
try {
    news.value = await $newsService.getSingleNews(idNews)
} catch (err) {
    const _err = $fetchModule.handleError(err)
    throw createError(_err)
}
</script>

<template>
    <NewsRead v-if="news" :news="news" />
</template>
