<script setup lang="ts">
import type { BlogPage } from '~/types/blog'

const route = useRoute()
const path = computed(() => String(route.params.path || ''))
const { data } = await useFetch<BlogPage>(() => `/api/pages/${encodeURIComponent(path.value)}`)
if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
useHead({ title: data.value.title })
</script>

<template>
  <section class="container stack" style="padding-top:42px;">
    <div class="panel glass">
      <h1 class="section-title">{{ data!.title }}</h1>
    </div>
    <div class="panel glass content">{{ data!.content }}</div>
  </section>
</template>
