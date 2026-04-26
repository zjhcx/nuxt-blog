<script setup lang="ts">
import { ExternalLink, ShieldCheck } from 'lucide-vue-next'

const route = useRoute()
const encoded = computed(() => String(route.params.path || ''))
const target = computed(() => decodeURIComponent(encoded.value))
const { data, error } = await useFetch<{ href: string; host: string }>('/api/redirect-target', {
  query: { to: target.value }
})

const go = () => {
  if (data.value?.href) window.location.href = data.value.href
}
</script>

<template>
  <section class="container hero">
    <h1>安全跳转</h1>
    <p>请确认即将访问的外部链接。</p>
  </section>
  <section class="container">
    <div class="panel glass stack">
      <template v-if="data">
        <p class="pill"><ShieldCheck :size="16" /> {{ data.host }}</p>
        <p class="content">{{ data.href }}</p>
        <button class="btn primary" type="button" @click="go"><ExternalLink :size="17" /> 继续访问</button>
      </template>
      <p v-else class="empty">{{ error?.statusMessage || '链接无效或协议不安全。' }}</p>
    </div>
  </section>
</template>
