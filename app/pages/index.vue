<script setup lang="ts">
import { LoaderCircle, Search } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'

const settings = useBlogSettings()
const page = ref(1)
const pageSize = 6
const keyword = ref('')
const articles = ref<BlogArticle[]>([])
const total = ref(0)

const { data: categories } = await useFetch<BlogCategory[]>('/api/categories')
const { data: tags } = await useFetch<BlogTag[]>('/api/tags')

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

const canLoadMore = computed(() => articles.value.length < total.value)
const loadMore = async () => {
  page.value += 1
  await loadArticles()
}
</script>

<template>
  <section class="container hero">
    <h1>{{ settings.title }}</h1>
    <p>{{ settings.subtitle }}</p>
  </section>

  <section class="container stack">
    <div class="panel glass">
      <label class="field">
        <span>搜索文章</span>
        <span style="display:flex; gap:10px;">
          <input v-model="keyword" class="input" type="search" placeholder="标题、摘要或正文" @keyup.enter="loadArticles(true)">
          <button class="btn" type="button" @click="loadArticles(true)"><Search :size="17" /> 搜索</button>
        </span>
      </label>
    </div>

    <ArticleGrid :articles="articles" :categories="categories || []" :tags="tags || []" />

    <button v-if="canLoadMore" class="btn primary" type="button" @click="loadMore">
      <LoaderCircle :size="17" /> 加载更多
    </button>
  </section>
</template>
