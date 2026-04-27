<script setup lang="ts">
import { FolderKanban } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'

type BlogSummary = {
  articles: BlogArticle[]
  categories: Array<BlogCategory & { count: number }>
  tags: Array<BlogTag & { count: number }>
}

const route = useRoute()
const path = computed(() => String(route.params.path || ''))
const { data } = await useFetch<{ category: BlogCategory; articles: BlogArticle[] }>(() => `/api/categories/${encodeURIComponent(path.value)}`)
const { data: categories } = await useFetch<BlogCategory[]>('/api/categories')
const { data: tags } = await useFetch<BlogTag[]>('/api/tags')
const { data: summary } = await useFetch<BlogSummary>('/api/summary')

if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
useHead({ title: `分类：${data.value.category.name}` })
</script>

<template>
  <SiteHero />
  <section class="section-band">
    <div class="content-container">
      <div class="layout-main">
        <div class="archive-panel panel">
          <h1><FolderKanban :size="20" /> {{ data!.category.name }}</h1>
          <p>{{ data!.category.description || '该分类下的全部文章。' }}</p>
        </div>
        <ArticleGrid :articles="data!.articles" :categories="categories || []" :tags="tags || []" />
      </div>
      <BlogSidebar
        :articles="summary?.articles || []"
        :categories="summary?.categories || []"
        :tags="summary?.tags || []"
      />
    </div>
  </section>
</template>
