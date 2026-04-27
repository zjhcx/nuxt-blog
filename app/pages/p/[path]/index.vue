<script setup lang="ts">
import { Edit3, Eye, Heart, MessageCircle, Share2 } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'
import { renderMarkdown } from '~/utils/markdown'

type BlogSummary = {
  articles: BlogArticle[]
  categories: Array<BlogCategory & { count: number }>
  tags: Array<BlogTag & { count: number }>
}

const route = useRoute()
const path = computed(() => String(route.params.path || ''))
const { data } = await useFetch<{ article: BlogArticle; category: BlogCategory | null; tags: BlogTag[] }>(
  () => `/api/articles/${encodeURIComponent(path.value)}`
)
const { data: summary } = await useFetch<BlogSummary>('/api/summary')

if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

useHead({ title: data.value.article.title })

const toc = computed(() => [
  { id: 'article-title', label: data.value?.article.title || '文章' },
  { id: 'article-content', label: '正文' }
])
const contentHtml = computed(() => renderMarkdown(data.value?.article.content || '', { allowHtml: true }))
</script>

<template>
  <section class="section-band article-shell">
    <div class="content-container">
      <article class="article-panel panel">
        <header class="article-head">
          <div class="article-head-top">
            <div class="stack" style="gap: 12px;">
              <strong>Administrator</strong>
              <div class="meta">
                <span>发布于 {{ new Date(data!.article.publishedAt).toLocaleDateString('zh-CN') }}</span>
                <span>/</span>
                <span><Eye :size="15" /> {{ data!.article.views || 0 }} 阅读</span>
              </div>
            </div>
            <div class="article-actions">
              <NuxtLink class="edit-btn" to="/admin"><Edit3 :size="18" /> 编辑</NuxtLink>
              <Heart :size="22" /><span>0</span>
              <MessageCircle :size="22" /><span>0</span>
              <Share2 :size="22" />
            </div>
          </div>

          <h1 id="article-title">{{ data!.article.title }}</h1>
          <div class="tags">
            <NuxtLink v-for="tag in data!.tags" :key="tag.id" class="pill" :to="`/t/${encodeURIComponent(tag.path)}`">
              #{{ tag.name }}
            </NuxtLink>
          </div>
        </header>

        <div id="article-content" class="content" v-html="contentHtml" />
        <hr class="article-divider">
        <CommentPanel target-type="article" :target-id="data!.article.id" />
      </article>

      <BlogSidebar
        :toc="toc"
        :articles="summary?.articles || []"
        :categories="summary?.categories || []"
        :tags="summary?.tags || []"
      />
    </div>
  </section>
</template>
