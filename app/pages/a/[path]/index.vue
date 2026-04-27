<script setup lang="ts">
import { Edit3, Eye, MessageCircle } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogPage, BlogTag } from '~/types/blog'
import { renderMarkdown } from '~/utils/markdown'

type BlogSummary = {
  articles: BlogArticle[]
  categories: Array<BlogCategory & { count: number }>
  tags: Array<BlogTag & { count: number }>
}

const route = useRoute()
const path = computed(() => String(route.params.path || ''))
const { data } = await useFetch<BlogPage>(() => `/api/pages/${encodeURIComponent(path.value)}`)
const { data: summary } = await useFetch<BlogSummary>('/api/summary')

if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
useHead({ title: data.value.title })
const contentHtml = computed(() => renderMarkdown(data.value?.content || '', { allowHtml: true }))
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
                <span>更新于 {{ new Date(data!.updatedAt).toLocaleDateString('zh-CN') }}</span>
                <span>/</span>
                <span><Eye :size="15" /> {{ data!.views || 0 }} 阅读</span>
              </div>
            </div>
            <div class="article-actions">
              <NuxtLink class="edit-btn" to="/admin"><Edit3 :size="18" /> 编辑</NuxtLink>
              <MessageCircle :size="22" /><span>0</span>
            </div>
          </div>
          <h1>{{ data!.title }}</h1>
        </header>
        <div class="content" v-html="contentHtml" />
        <hr class="article-divider">
        <CommentPanel target-type="page" :target-id="data!.id" />
      </article>
      <BlogSidebar
        :articles="summary?.articles || []"
        :categories="summary?.categories || []"
        :tags="summary?.tags || []"
      />
    </div>
  </section>
</template>
