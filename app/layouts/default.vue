<script setup lang="ts">
import { Moon, Settings, Sun } from 'lucide-vue-next'
import type { BlogNavItem, BlogSettings } from '~/types/blog'

const colorMode = useColorMode()
const settingsState = useBlogSettings()
const { data: settings } = await useFetch<BlogSettings>('/api/settings')
const { data: navItems } = await useFetch<BlogNavItem[]>('/api/nav')

if (settings.value) settingsState.value = settings.value

const siteStyle = computed(() => ({
  '--site-bg': settingsState.value.backgroundImage ? `url("${settingsState.value.backgroundImage}")` : 'linear-gradient(135deg, #e7f8f5, #f7e9ef 48%, #e9eefc)',
  '--bg-overlay': String(settingsState.value.backgroundOverlay),
  '--glass-opacity': String(settingsState.value.glassOpacity)
}))

const toggleMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="site-shell" :style="siteStyle">
    <header class="topbar">
      <nav class="container nav">
        <NuxtLink class="brand" to="/">
          <strong>{{ settingsState.title }}</strong>
          <span>{{ settingsState.subtitle }}</span>
        </NuxtLink>
        <div class="nav-links">
          <NuxtLink v-for="item in navItems || []" :key="item.id" class="nav-link" :to="item.href">
            {{ item.label }}
          </NuxtLink>
          <NuxtLink class="icon-button" to="/admin" title="管理后台">
            <Settings :size="18" />
          </NuxtLink>
          <button class="icon-button" type="button" title="切换深浅色" @click="toggleMode">
            <Moon v-if="colorMode.value === 'light'" :size="18" />
            <Sun v-else :size="18" />
          </button>
        </div>
      </nav>
    </header>
    <main class="page-main">
      <slot />
    </main>
  </div>
</template>
