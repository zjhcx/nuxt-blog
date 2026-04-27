<script setup lang="ts">
import { Eye, Flame, FolderKanban, List, Tag, Tags } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogTag } from '~/types/blog'

type CountedCategory = BlogCategory & { count?: number }
type CountedTag = BlogTag & { count?: number }

const props = defineProps<{
  articles?: BlogArticle[]
  categories?: CountedCategory[]
  tags?: CountedTag[]
  toc?: Array<{ id: string; label: string }>
}>()

const hotArticles = computed(() => props.articles?.slice(0, 5) || [])
const categoryItems = computed(() => props.categories?.filter((item) => (item.count || 0) > 0) || [])
const tagItems = computed(() => props.tags?.filter((item) => (item.count || 0) > 0) || [])
</script>

<template>
  <aside class="blog-sidebar">
    <section v-if="toc?.length" class="side-card">
      <h2><List :size="20" /> 目录</h2>
      <nav class="toc-list">
        <a v-for="item in toc" :key="item.id" :href="`#${item.id}`">{{ item.label }}</a>
      </nav>
    </section>

    <section class="side-card">
      <h2><Flame :size="20" class="hot-icon" /> 热门文章</h2>
      <div v-if="hotArticles.length" class="hot-list">
        <NuxtLink v-for="article in hotArticles" :key="article.id" :to="`/p/${encodeURIComponent(article.path)}`">
          <strong>{{ article.title }}</strong>
          <span>{{ new Date(article.publishedAt).toLocaleDateString('zh-CN') }} <Eye :size="13" /> 0</span>
        </NuxtLink>
      </div>
      <p v-else class="side-empty">暂无文章</p>
    </section>

    <section class="side-card">
      <h2><FolderKanban :size="20" /> 分类目录</h2>
      <div v-if="categoryItems.length" class="count-list">
        <NuxtLink v-for="category in categoryItems" :key="category.id" :to="`/c/${encodeURIComponent(category.path)}`">
          <span>{{ category.name }}</span>
          <em>{{ category.count }}</em>
        </NuxtLink>
      </div>
      <p v-else class="side-empty">暂无分类</p>
    </section>

    <section class="side-card">
      <h2><Tags :size="20" /> 标签 <NuxtLink class="side-more" to="/">更多</NuxtLink></h2>
      <div v-if="tagItems.length" class="side-tags">
        <NuxtLink v-for="tagItem in tagItems" :key="tagItem.id" :to="`/t/${encodeURIComponent(tagItem.path)}`">
          <Tag :size="13" /> #{{ tagItem.name }} <sup>{{ tagItem.count }}</sup>
        </NuxtLink>
      </div>
      <p v-else class="side-empty">暂无标签</p>
    </section>
  </aside>
</template>
