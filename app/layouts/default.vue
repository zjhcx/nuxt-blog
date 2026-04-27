<script setup lang="ts">
import { ChevronUp, Globe2, Moon, Search, Sun } from 'lucide-vue-next'
import type { BlogNavItem, BlogSettings } from '~/types/blog'

const colorMode = useColorMode()
const router = useRouter()
const settingsState = useBlogSettings()
const { data: settings } = await useFetch<BlogSettings>('/api/settings')
const { data: navItems } = await useFetch<BlogNavItem[]>('/api/nav')

if (settings.value) settingsState.value = settings.value

const searchOpen = ref(false)
const searchKeyword = ref('')

const siteStyle = computed(() => ({
  '--site-bg': settingsState.value.backgroundImage ? `url("${settingsState.value.backgroundImage}")` : 'radial-gradient(circle at 64% 44%, #63788f 0 17%, #1b2838 31%, #07101d 58%, #050914 100%)',
  '--hero-bg': (settingsState.value.heroBackgroundImage || settingsState.value.backgroundImage) ? `url("${settingsState.value.heroBackgroundImage || settingsState.value.backgroundImage}")` : 'radial-gradient(circle at 64% 44%, #63788f 0 17%, #1b2838 31%, #07101d 58%, #050914 100%)',
  '--bg-overlay': String(settingsState.value.backgroundOverlay),
  '--glass-opacity': String(settingsState.value.glassOpacity)
}))

const toggleMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const backTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const submitSearch = async () => {
  const q = searchKeyword.value.trim()
  if (!q) return
  searchOpen.value = false
  await router.push({ path: '/', query: { q } })
}
</script>

<template>
  <div class="site-shell" :style="siteStyle">
    <header class="topbar">
      <nav class="container nav">
        <div class="nav-main">
          <NuxtLink class="brand" to="/">
            <strong>{{ settingsState.title }}</strong>
            <span>{{ settingsState.subtitle }}</span>
          </NuxtLink>
          <div class="nav-links">
            <NuxtLink v-for="item in navItems || []" :key="item.id" class="nav-link" :to="item.href">
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>
        <div class="nav-actions">
          <button class="icon-button" type="button" title="搜索" @click="searchOpen = true">
            <Search :size="21" />
          </button>
          <button class="icon-button" type="button" title="切换深浅色" @click="toggleMode">
            <Moon v-if="colorMode.value === 'light'" :size="18" />
            <Sun v-else :size="18" />
          </button>
          <NuxtLink class="icon-button accent" to="/admin" title="管理后台">
            <Globe2 :size="21" />
          </NuxtLink>
        </div>
      </nav>
    </header>
    <main class="page-main">
      <slot />
    </main>
    <footer class="footer">
      <div class="footer-brand">{{ settingsState.title }}</div>
      <div class="footer-copy">© {{ new Date().getFullYear() }} {{ settingsState.title }}. All Rights Reserved. Powered by Nuxt.</div>
    </footer>
    <div v-if="searchOpen" class="search-overlay" @click.self="searchOpen = false">
      <form class="search-dialog" @submit.prevent="submitSearch">
        <Search :size="22" />
        <input v-model="searchKeyword" autofocus placeholder="搜索文章和页面">
        <button class="btn primary" type="submit">搜索</button>
      </form>
    </div>
    <button class="backtop" type="button" title="返回顶部" @click="backTop">
      <ChevronUp :size="26" />
    </button>
  </div>
</template>
