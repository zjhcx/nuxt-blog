<script setup lang="ts">
import { Send } from 'lucide-vue-next'
import type { BlogComment } from '~/types/blog'
import { renderMarkdown } from '~/utils/markdown'

const props = defineProps<{
  targetType: 'article' | 'page'
  targetId: string
}>()

const authorName = ref('访客')
const content = ref('')
const submitting = ref(false)
const { data: comments, refresh } = await useFetch<BlogComment[]>('/api/comments', {
  query: { targetType: props.targetType, targetId: props.targetId }
})

const submitComment = async () => {
  const value = content.value.trim()
  if (!value) return
  submitting.value = true
  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: { targetType: props.targetType, targetId: props.targetId, authorName: authorName.value, content: value }
    })
    content.value = ''
    await refresh()
  } finally {
    submitting.value = false
  }
}

const commentHtml = (value: string) => renderMarkdown(value, { allowHtml: false })
</script>

<template>
  <section class="comment-panel">
    <h2>评论</h2>
    <label class="field">
      <span>昵称</span>
      <input v-model="authorName" class="input" maxlength="32">
    </label>
    <ClientOnly>
      <EditorMd v-model="content" placeholder="编写 Markdown 评论" :height="220" />
    </ClientOnly>
    <div class="comment-actions">
      <strong>{{ authorName || '访客' }}</strong>
      <button class="btn primary" type="button" :disabled="submitting" @click="submitComment"><Send :size="17" /> 提交评论</button>
    </div>
    <strong class="comment-count">{{ comments?.length || 0 }} 条评论</strong>
    <div v-if="comments?.length" class="comment-list">
      <article v-for="comment in comments" :key="comment.id" class="comment-item">
        <strong>{{ comment.authorName }}</strong>
        <time>{{ new Date(comment.createdAt).toLocaleString('zh-CN') }}</time>
        <div class="comment-content" v-html="commentHtml(comment.content)" />
      </article>
    </div>
  </section>
</template>
