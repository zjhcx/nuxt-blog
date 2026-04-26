<script setup lang="ts">
import type { BlogArticle, BlogCategory } from '~/types/blog'

const route = useRoute()
const path = computed(() => String(route.params.path || ''))
const { data } = await useFetch<{ category: BlogCategory; articles: BlogArticle[] }>(() => `/api/categories/${encodeURIComponent(path.value)}`)
const { data: categories } = await useFetch('/api/categories')
const { data: tags } = await useFetch('/api/tags')
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
useHead({ title: `分类：${data.value.category.name}` })
</script>

<template>
  <section class="container hero">
    <h1>{{ data!.category.name }}</h1>
    <p>{{ data!.category.description || '该分类下的全部文章。' }}</p>
  </section>
  <section class="container">
    <ArticleGrid :articles="data!.articles" :categories="categories || []" :tags="tags || []" />
  </section>
</template>
