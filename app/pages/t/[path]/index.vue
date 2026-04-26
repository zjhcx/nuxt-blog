<script setup lang="ts">
import type { BlogArticle, BlogTag } from '~/types/blog'

const route = useRoute()
const path = computed(() => String(route.params.path || ''))
const { data } = await useFetch<{ tag: BlogTag; articles: BlogArticle[] }>(() => `/api/tags/${encodeURIComponent(path.value)}`)
const { data: categories } = await useFetch('/api/categories')
const { data: tags } = await useFetch('/api/tags')
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
useHead({ title: `标签：${data.value.tag.name}` })
</script>

<template>
  <section class="container hero">
    <h1># {{ data!.tag.name }}</h1>
    <p>{{ data!.tag.description || '该标签下的全部文章。' }}</p>
  </section>
  <section class="container">
    <ArticleGrid :articles="data!.articles" :categories="categories || []" :tags="tags || []" />
  </section>
</template>
