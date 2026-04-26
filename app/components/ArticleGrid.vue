<script setup lang="ts">
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'

defineProps<{
  articles: BlogArticle[]
  categories?: BlogCategory[]
  tags?: BlogTag[]
}>()
</script>

<template>
  <div v-if="articles.length" class="grid">
    <ArticleCard v-for="article in articles" :key="article.id" :article="article" :categories="categories" :tags="tags" />
  </div>
  <div v-else class="panel glass empty">暂无内容。请进入后台创建文章。</div>
</template>
