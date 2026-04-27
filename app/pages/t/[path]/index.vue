<script setup lang="ts">
import { Tags } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'

type BlogSummary = {
  articles: BlogArticle[]
  categories: Array<BlogCategory & { count: number }>
  tags: Array<BlogTag & { count: number }>
}

const route = useRoute()
const path = computed(() => String(route.params.path || ''))
const { data } = await useFetch<{ tag: BlogTag; articles: BlogArticle[] }>(() => `/api/tags/${encodeURIComponent(path.value)}`)
const { data: categories } = await useFetch<BlogCategory[]>('/api/categories')
const { data: tags } = await useFetch<BlogTag[]>('/api/tags')
const { data: summary } = await useFetch<BlogSummary>('/api/summary')

if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
useHead({ title: `标签：${data.value.tag.name}` })
</script>

<template>
  <SiteHero />
  <section class="section-band">
    <div class="content-container">
      <div class="layout-main">
        <div class="archive-panel panel">
          <h1><Tags :size="20" /> 所有标签</h1>
          <div class="tags" style="margin-top: 20px;">
            <NuxtLink class="pill" :to="`/t/${encodeURIComponent(data!.tag.path)}`">#{{ data!.tag.name }}</NuxtLink>
          </div>
          <p>{{ data!.tag.description || '该标签下的全部文章。' }}</p>
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
