<script setup lang="ts">
import { CalendarDays, FolderOpen, Tags } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'

const props = defineProps<{
  article: BlogArticle
  categories?: BlogCategory[]
  tags?: BlogTag[]
}>()

const category = computed(() => props.categories?.find((item) => item.path === props.article.categoryPath))
const articleTags = computed(() => props.tags?.filter((item) => props.article.tagPaths.includes(item.path)) || [])
const formattedDate = computed(() => new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(new Date(props.article.publishedAt)))
</script>

<template>
  <article class="article-card glass">
    <NuxtLink
      class="article-cover"
      :to="`/p/${encodeURIComponent(article.path)}`"
      :style="{ backgroundImage: article.cover ? `url(${article.cover})` : undefined }"
    />
    <div class="article-body">
      <div class="meta">
        <span><CalendarDays :size="15" /> {{ formattedDate }}</span>
        <NuxtLink v-if="category" :to="`/c/${encodeURIComponent(category.path)}`">
          <FolderOpen :size="15" /> {{ category.name }}
        </NuxtLink>
      </div>
      <NuxtLink :to="`/p/${encodeURIComponent(article.path)}`">
        <h2>{{ article.title }}</h2>
      </NuxtLink>
      <p>{{ article.excerpt || article.content.slice(0, 120) }}</p>
      <div class="tags">
        <NuxtLink v-for="tag in articleTags" :key="tag.id" class="pill" :to="`/t/${encodeURIComponent(tag.path)}`">
          <Tags :size="14" /> {{ tag.name }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.meta span, .meta a { display: inline-flex; align-items: center; gap: 5px; }
</style>
