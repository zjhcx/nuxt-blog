<script setup lang="ts">
import { Globe2 } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'
import { stripMarkdown } from '~/utils/markdown'

const props = defineProps<{
  article: BlogArticle
  categories?: BlogCategory[]
  tags?: BlogTag[]
}>()

const category = computed(() => props.categories?.find((item) => item.path === props.article.categoryPath))
const articleTags = computed(() => props.tags?.filter((item) => props.article.tagPaths.includes(item.path)) || [])
const formattedDate = computed(() => new Intl.DateTimeFormat('zh-CN').format(new Date(props.article.publishedAt)))
const summary = computed(() => props.article.excerpt || stripMarkdown(props.article.content).slice(0, 120))
</script>

<template>
  <article class="article-card">
    <div class="article-body">
      <div class="meta">
        <NuxtLink v-if="category" :to="`/c/${encodeURIComponent(category.path)}`">{{ category.name }}</NuxtLink>
        <span v-for="tag in articleTags" :key="tag.id">#{{ tag.name }}</span>
      </div>
      <NuxtLink :to="`/p/${encodeURIComponent(article.path)}`">
        <h2>{{ article.title }}</h2>
      </NuxtLink>
      <p>{{ summary }}</p>
      <div class="card-footer">
        <span class="author"><span class="avatar"><Globe2 :size="22" /></span> Administrator</span>
        <span class="date-block">发布于 {{ formattedDate }}</span>
      </div>
    </div>
  </article>
</template>
