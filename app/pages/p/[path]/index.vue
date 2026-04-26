<script setup lang="ts">
import { CalendarDays, FolderOpen, Tags } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'

const route = useRoute()
const path = computed(() => String(route.params.path || ''))
const { data } = await useFetch<{ article: BlogArticle; category: BlogCategory | null; tags: BlogTag[] }>(
  () => `/api/articles/${encodeURIComponent(path.value)}`
)

if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

useHead({ title: data.value.article.title })
</script>

<template>
  <article class="container stack" style="padding-top:42px;">
    <div class="panel glass stack">
      <div class="meta">
        <span><CalendarDays :size="15" /> {{ new Date(data!.article.publishedAt).toLocaleDateString('zh-CN') }}</span>
        <NuxtLink v-if="data!.category" :to="`/c/${encodeURIComponent(data!.category.path)}`">
          <FolderOpen :size="15" /> {{ data!.category.name }}
        </NuxtLink>
      </div>
      <h1 class="section-title">{{ data!.article.title }}</h1>
      <div class="tags">
        <NuxtLink v-for="tag in data!.tags" :key="tag.id" class="pill" :to="`/t/${encodeURIComponent(tag.path)}`">
          <Tags :size="14" /> {{ tag.name }}
        </NuxtLink>
      </div>
    </div>
    <div
      v-if="data!.article.cover"
      class="article-cover glass"
      :style="{ minHeight: '360px', borderRadius: '8px', backgroundImage: `url(${data!.article.cover})` }"
    />
    <div class="panel glass content">{{ data!.article.content }}</div>
  </article>
</template>

<style scoped>
.meta span, .meta a { display: inline-flex; align-items: center; gap: 5px; }
</style>
