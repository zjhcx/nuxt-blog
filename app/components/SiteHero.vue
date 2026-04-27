<script setup lang="ts">
const settings = useBlogSettings()
</script>

<template>
  <section class="site-hero" aria-label="站点封面">
    <div class="site-hero__shade" />
    <h1>{{ settings.title }}</h1>
  </section>
</template>
