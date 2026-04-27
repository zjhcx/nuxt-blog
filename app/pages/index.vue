<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'

type BlogSummary = {
  articles: BlogArticle[]
  categories: Array<BlogCategory & { count: number }>
  tags: Array<BlogTag & { count: number }>
}

const page = ref(1)
const pageSize = 6
const route = useRoute()
const keyword = ref(String(route.query.q || ''))
const articles = ref<BlogArticle[]>([])
const total = ref(0)

const { data: categories } = await useFetch<BlogCategory[]>('/api/categories')
const { data: tags } = await useFetch<BlogTag[]>('/api/tags')
const { data: summary } = await useFetch<BlogSummary>('/api/summary')

const loadArticles = async (reset = false) => {
  if (reset) {
    page.value = 1
    articles.value = []
  }
  const result = await $fetch<{ items: BlogArticle[]; total: number }>('/api/articles', {
    query: { page: page.value, pageSize, q: keyword.value }
  })
  articles.value = reset ? result.items : [...articles.value, ...result.items]
  total.value = result.total
}

await loadArticles(true)

watch(() => route.query.q, async (value) => {
  keyword.value = String(value || '')
  await loadArticles(true)
})

const canLoadMore = computed(() => articles.value.length < total.value)
const loadMore = async () => {
  page.value += 1
  await loadArticles()
}
</script>

<template>
  <SiteHero />

  <section class="section-band">
    <div class="content-container">
      <div class="layout-main">
        <nav class="category-tabs" aria-label="分类">
          <NuxtLink :class="{ active: !keyword }" to="/">全部</NuxtLink>
          <NuxtLink v-for="category in categories || []" :key="category.id" :to="`/c/${encodeURIComponent(category.path)}`">
            {{ category.name }}
          </NuxtLink>
        </nav>

        <div v-if="keyword" class="archive-panel panel">
          <h1>搜索：{{ keyword }}</h1>
          <p>找到 {{ total }} 篇相关文章。</p>
        </div>

        <ArticleGrid :articles="articles" :categories="categories || []" :tags="tags || []" />

        <button v-if="canLoadMore" class="btn primary" type="button" style="margin-top: 24px;" @click="loadMore">
          <LoaderCircle :size="17" /> 加载更多
        </button>
      </div>

      <BlogSidebar
        :articles="summary?.articles || []"
        :categories="summary?.categories || []"
        :tags="summary?.tags || []"
      />
    </div>
  </section>
</template>
