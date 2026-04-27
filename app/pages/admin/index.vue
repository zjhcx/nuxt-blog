<script setup lang="ts">
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  Folder,
  Gauge,
  Image,
  LayoutDashboard,
  Moon,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Paintbrush,
  PlusCircle,
  RefreshCcw,
  Save,
  Search,
  Settings,
  Sun,
  Tags,
  Trash2,
  UserCog,
  Users
} from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogComment, BlogData, BlogNavItem, BlogPage, BlogSettings, BlogTag, BlogUser } from '~/types/blog'
import { renderMarkdown } from '~/utils/markdown'

definePageMeta({ layout: false })
useHead({ title: '管理后台' })

type AdminUser = Pick<BlogUser, 'id' | 'username' | 'displayName' | 'role' | 'createdAt'>
type AdminStats = { articles: number; pages: number; comments: number; users: number; views: number }

const active = ref('dashboard')
const saving = ref(false)
const error = ref('')
const user = ref<AdminUser | null>(null)
const adminTheme = ref<'light' | 'dark'>('light')
const data = ref<BlogData | null>(null)
const stats = ref<AdminStats>({ articles: 0, pages: 0, comments: 0, users: 0, views: 0 })
const loginForm = reactive({ username: 'admin', password: 'admin123' })
const adminSearch = ref('')

const emptyArticle = (): Partial<BlogArticle> => ({ status: 'published', title: '', path: '', excerpt: '', content: '', cover: '', categoryPath: '', tagPaths: [], views: 0 })
const emptyCategory = (): Partial<BlogCategory> => ({ name: '', path: '', description: '' })
const emptyTag = (): Partial<BlogTag> => ({ name: '', path: '', description: '' })
const emptyNav = (): Partial<BlogNavItem> => ({ label: '', href: '/', sort: (data.value?.navItems.length || 0) + 1, visible: true })
const emptyPage = (): Partial<BlogPage> => ({ title: '', path: '', content: '', views: 0 })

const articleForm = ref<Partial<BlogArticle>>(emptyArticle())
const categoryForm = ref<Partial<BlogCategory>>(emptyCategory())
const tagForm = ref<Partial<BlogTag>>(emptyTag())
const navForm = ref<Partial<BlogNavItem>>(emptyNav())
const pageForm = ref<Partial<BlogPage>>(emptyPage())
const settingsForm = ref<BlogSettings>({ title: 'Nuxt Blog', subtitle: '', backgroundImage: '', heroBackgroundImage: '', backgroundOverlay: 0.54, glassOpacity: 0.68 })
const showCategoryModal = ref(false)
const showTagModal = ref(false)
const showNavModal = ref(false)

const navGroups = [
  { title: '', items: [{ id: 'dashboard', label: '仪表盘', icon: Gauge }] },
  { title: '内容', items: [{ id: 'articles', label: '文章', icon: BookOpen }, { id: 'pages', label: '页面', icon: FileText }, { id: 'comments', label: '评论', icon: MessageSquare }, { id: 'assets', label: '附件', icon: Folder }] },
  { title: '外观', items: [{ id: 'settings', label: '主题', icon: Paintbrush }, { id: 'nav', label: '菜单', icon: Menu }] },
  { title: '系统', items: [{ id: 'users', label: '用户', icon: UserCog }, { id: 'overview', label: '概览', icon: BarChart3 }, { id: 'tools', label: '工具', icon: Settings }] }
]

const pageTitle = computed(() => ({
  dashboard: '仪表盘',
  articles: '文章',
  categories: '文章分类',
  tags: '文章标签',
  pages: '页面',
  comments: '评论',
  trash: '回收站',
  editor: '文章',
  'page-editor': '页面',
  nav: '菜单',
  users: '用户',
  settings: '主题',
  assets: '附件',
  overview: '概览',
  tools: '工具'
}[active.value] || '仪表盘'))

const categoryName = (path?: string) => data.value?.categories.find((item) => item.path === path)?.name || '默认分类'
const articleComments = (id: string) => data.value?.comments.filter((item) => item.targetType === 'article' && item.targetId === id).length || 0
const pageComments = (id: string) => data.value?.comments.filter((item) => item.targetType === 'page' && item.targetId === id).length || 0
const activeArticles = computed(() => data.value?.articles.filter((item) => !item.deletedAt) || [])
const activePages = computed(() => data.value?.pages.filter((item) => !item.deletedAt) || [])
const trashedArticles = computed(() => data.value?.articles.filter((item) => item.deletedAt) || [])
const trashedPages = computed(() => data.value?.pages.filter((item) => item.deletedAt) || [])

const loadAdmin = async () => {
  data.value = await $fetch<BlogData>('/api/admin/all')
  stats.value = await $fetch<AdminStats>('/api/admin/stats')
  settingsForm.value = { ...data.value.settings }
}

const checkAuth = async () => {
  const result = await $fetch<{ user: AdminUser | null }>('/api/admin/me')
  user.value = result.user
  if (user.value) await loadAdmin()
}

onMounted(checkAuth)
onMounted(() => {
  const stored = localStorage.getItem('nuxt-blog-admin-theme')
  if (stored === 'dark' || stored === 'light') adminTheme.value = stored
})

watch(adminTheme, (value) => {
  if (import.meta.client) localStorage.setItem('nuxt-blog-admin-theme', value)
})

const toggleAdminTheme = () => {
  adminTheme.value = adminTheme.value === 'dark' ? 'light' : 'dark'
}

const login = async () => {
  error.value = ''
  try {
    const result = await $fetch<{ user: AdminUser }>('/api/admin/login', { method: 'POST', body: loginForm })
    user.value = result.user
    await loadAdmin()
  } catch (err: any) {
    error.value = err?.statusMessage || '登录失败'
  }
}

const logout = async () => {
  await $fetch('/api/admin/logout', { method: 'POST' })
  user.value = null
  data.value = null
}

const run = async (fn: () => Promise<unknown>) => {
  saving.value = true
  try {
    await fn()
    await loadAdmin()
  } finally {
    saving.value = false
  }
}

const saveArticle = () => run(async () => {
  await $fetch('/api/admin/articles', { method: 'POST', body: articleForm.value })
  articleForm.value = emptyArticle()
})
const editArticle = (item?: BlogArticle) => {
  articleForm.value = item ? { ...item, tagPaths: [...item.tagPaths] } : emptyArticle()
  active.value = 'editor'
}
const deleteArticle = (id: string) => run(() => $fetch(`/api/admin/articles/${id}`, { method: 'DELETE' }))

const savePage = () => run(async () => {
  await $fetch('/api/admin/pages', { method: 'POST', body: pageForm.value })
  pageForm.value = emptyPage()
})
const editPage = (item?: BlogPage) => { pageForm.value = item ? { ...item } : emptyPage(); active.value = 'page-editor' }
const deletePage = (id: string) => run(() => $fetch(`/api/admin/pages/${id}`, { method: 'DELETE' }))

const saveCategory = () => run(async () => {
  await $fetch('/api/admin/categories', { method: 'POST', body: categoryForm.value })
  categoryForm.value = emptyCategory()
  showCategoryModal.value = false
})
const editCategory = (item?: BlogCategory) => { categoryForm.value = item ? { ...item } : emptyCategory(); showCategoryModal.value = true }
const deleteCategory = (id: string) => run(() => $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }))

const saveTag = () => run(async () => {
  await $fetch('/api/admin/tags', { method: 'POST', body: tagForm.value })
  tagForm.value = emptyTag()
  showTagModal.value = false
})
const editTag = (item?: BlogTag) => { tagForm.value = item ? { ...item } : emptyTag(); showTagModal.value = true }
const deleteTag = (id: string) => run(() => $fetch(`/api/admin/tags/${id}`, { method: 'DELETE' }))

const saveNav = () => run(async () => {
  await $fetch('/api/admin/nav', { method: 'POST', body: navForm.value })
  navForm.value = emptyNav()
  showNavModal.value = false
})
const editNav = (item?: BlogNavItem) => { navForm.value = item ? { ...item } : emptyNav(); showNavModal.value = true }
const deleteNav = (id: string) => run(() => $fetch(`/api/admin/nav/${id}`, { method: 'DELETE' }))

const saveSettings = () => run(async () => {
  await $fetch('/api/admin/settings', { method: 'PUT', body: settingsForm.value })
  useBlogSettings().value = { ...settingsForm.value }
})

const deleteComment = (id: string) => run(() => $fetch(`/api/admin/comments/${id}`, { method: 'DELETE' }))
const restoreTrash = (type: 'article' | 'page', id: string) => run(() => $fetch(`/api/admin/trash/${type}/${id}`, { method: 'PUT' }))
const purgeTrash = (type: 'article' | 'page', id: string) => run(() => $fetch(`/api/admin/trash/${type}/${id}`, { method: 'DELETE' }))
const markdownPreview = (value: string) => renderMarkdown(value, { allowHtml: false })
</script>

<template>
  <div v-if="!user" class="admin-login">
    <form class="admin-login-card" @submit.prevent="login">
      <div class="admin-logo">Halo</div>
      <h1>管理员登录</h1>
      <label><span>用户名</span><input v-model="loginForm.username" autocomplete="username"></label>
      <label><span>密码</span><input v-model="loginForm.password" type="password" autocomplete="current-password"></label>
      <p v-if="error" class="admin-error">{{ error }}</p>
      <button class="admin-primary" type="submit">登录</button>
    </form>
  </div>

  <div v-else class="admin-console" :class="`admin-${adminTheme}`">
    <aside class="halo-sidebar">
      <div class="admin-logo">Halo</div>
      <label class="halo-search"><Search :size="20" /><input v-model="adminSearch" placeholder="搜索"><span>⌘+K</span></label>
      <nav class="halo-nav">
        <section v-for="group in navGroups" :key="group.title || 'main'">
          <p v-if="group.title">{{ group.title }}</p>
          <button v-for="item in group.items" :key="item.id" :class="{ active: active === item.id }" type="button" @click="active = item.id">
            <component :is="item.icon" :size="20" /> {{ item.label }}
          </button>
        </section>
      </nav>
      <div class="halo-profile">
        <strong>{{ user.displayName }}</strong>
        <span>超级管理员</span>
        <button type="button" title="退出登录" @click="logout"><LogOut :size="22" /></button>
      </div>
    </aside>

    <main v-if="data" class="halo-main">
      <header class="halo-top">
        <h1><LayoutDashboard v-if="active === 'dashboard'" :size="26" /><BookOpen v-else :size="26" />{{ pageTitle }}</h1>
        <div class="halo-top-actions">
          <button class="halo-btn" type="button" title="切换深浅色" @click="toggleAdminTheme">
            <Sun v-if="adminTheme === 'dark'" :size="18" />
            <Moon v-else :size="18" />
            {{ adminTheme === 'dark' ? '浅色' : '深色' }}
          </button>
          <button v-if="active === 'dashboard'" class="halo-dark-btn" type="button" @click="active = 'settings'"><Settings :size="18" /> 设置</button>
          <template v-if="active === 'articles'">
            <button class="halo-btn" type="button" @click="active = 'categories'">分类</button>
            <button class="halo-btn" type="button" @click="active = 'tags'">标签</button>
            <button class="halo-btn" type="button" @click="active = 'trash'">回收站</button>
            <button class="halo-dark-btn" type="button" @click="editArticle()"><PlusCircle :size="18" /> 新建</button>
          </template>
          <button v-if="active === 'pages'" class="halo-dark-btn" type="button" @click="editPage()"><PlusCircle :size="18" /> 新建</button>
          <button v-if="active === 'categories'" class="halo-dark-btn" type="button" @click="editCategory()"><PlusCircle :size="18" /> 新建</button>
          <button v-if="active === 'tags'" class="halo-dark-btn" type="button" @click="editTag()"><PlusCircle :size="18" /> 新建</button>
        </div>
      </header>

      <section v-if="active === 'dashboard'" class="halo-dashboard">
        <div class="stat-grid">
          <article><span><BookOpen :size="24" /></span><div>文章<strong>{{ stats.articles }}</strong></div></article>
          <article><span><Users :size="24" /></span><div>用户<strong>{{ stats.users }}</strong></div></article>
          <article><span><MessageSquare :size="24" /></span><div>评论<strong>{{ stats.comments }}</strong></div></article>
          <article><span><BarChart3 :size="24" /></span><div>浏览量<strong>{{ stats.views }}</strong></div></article>
        </div>
        <div class="dashboard-grid">
          <section class="halo-card">
            <h2>快捷访问</h2>
            <div class="quick-grid">
              <button type="button" @click="active = 'users'"><Users :size="24" />个人中心<ArrowRight :size="18" /></button>
              <button type="button" @click="navigateTo('/')"><LayoutDashboard :size="24" />查看站点<ArrowRight :size="18" /></button>
              <button type="button" @click="editArticle()"><BookOpen :size="24" />创建文章<ArrowRight :size="18" /></button>
              <button type="button" @click="editPage()"><FileText :size="24" />创建页面<ArrowRight :size="18" /></button>
              <button type="button" @click="active = 'settings'"><Paintbrush :size="24" />主题管理<ArrowRight :size="18" /></button>
              <button type="button" @click="loadAdmin"><RefreshCcw :size="24" />刷新数据<ArrowRight :size="18" /></button>
            </div>
          </section>
          <section class="halo-card">
            <div class="card-head"><h2>通知</h2><button type="button">查看全部</button></div>
            <p class="notice">你的 {{ data.settings.title }} 账号被用于在本机登录。</p>
            <p class="muted">@{{ user.username }} 你好：站点内容和统计已连接到真实数据。</p>
          </section>
        </div>
      </section>

      <section v-if="active === 'articles'" class="halo-card table-card">
        <div class="table-toolbar">
          <input type="checkbox">
          <label><Search :size="18" /><input v-model="adminSearch" placeholder="输入关键词搜索"></label>
          <div class="filters"><span>状态：全部 <ChevronDown :size="16" /></span><span>分类 <ChevronDown :size="16" /></span><span>排序：默认 <ChevronDown :size="16" /></span><RefreshCcw :size="18" /></div>
        </div>
        <article v-for="item in activeArticles" :key="item.id" class="halo-row">
          <input type="checkbox">
          <div><strong>{{ item.title }}</strong><p>分类：{{ categoryName(item.categoryPath) }}　访问量 {{ item.views || 0 }}　评论 {{ articleComments(item.id) }}</p><span v-for="tag in item.tagPaths" :key="tag">{{ tag }}</span></div>
          <em>A</em><small>{{ item.status === 'published' ? '已发布' : '草稿' }}</small><button type="button" @click="editArticle(item)">编辑</button><button type="button" @click="deleteArticle(item.id)"><Trash2 :size="17" /></button>
        </article>
        <footer>共 {{ activeArticles.length }} 项数据</footer>
      </section>

      <section v-if="active === 'editor'" class="editor-shell">
        <div class="editor-toolbar"><button @click="active = 'articles'">返回</button><button class="halo-btn"><Save :size="17" /> 保存</button><button class="halo-dark-btn" @click="saveArticle">发布</button></div>
        <input v-model="articleForm.title" class="editor-title" placeholder="请输入标题">
        <div class="editor-grid">
          <ClientOnly>
            <EditorMd v-model="articleForm.content" placeholder="输入 Markdown，支持直接混用 HTML" allow-html :height="620" />
          </ClientOnly>
          <aside class="editor-aside">
            <label>路径<input v-model="articleForm.path"></label>
            <label>摘要<textarea v-model="articleForm.excerpt"></textarea></label>
            <label>分类<select v-model="articleForm.categoryPath"><option value="">默认分类</option><option v-for="c in data.categories" :key="c.id" :value="c.path">{{ c.name }}</option></select></label>
            <label>标签<select v-model="articleForm.tagPaths" multiple><option v-for="t in data.tags" :key="t.id" :value="t.path">{{ t.name }}</option></select></label>
          </aside>
        </div>
      </section>

      <section v-if="active === 'categories'" class="halo-card table-card compact">
        <h2>{{ data.categories.length }} 个分类</h2>
        <article v-for="item in data.categories" :key="item.id" class="halo-row">
          <div><strong>{{ item.name }}</strong><p>/categories/{{ item.path }}</p></div>
          <small>{{ activeArticles.filter((a) => a.categoryPath === item.path).length }} 篇文章</small>
          <button type="button" @click="editCategory(item)">编辑</button>
          <button type="button" @click="deleteCategory(item.id)"><MoreHorizontal :size="20" /></button>
        </article>
      </section>

      <section v-if="active === 'tags'" class="halo-card table-card">
        <div class="table-toolbar"><input type="checkbox"><label><Search :size="18" /><input placeholder="输入关键词搜索"></label><div class="filters"><span>排序：默认 <ChevronDown :size="16" /></span><RefreshCcw :size="18" /></div></div>
        <article v-for="item in data.tags" :key="item.id" class="halo-row">
          <input type="checkbox"><div><strong class="tag-chip">{{ item.name }}</strong><p>/tags/{{ item.path }}</p></div>
          <small>{{ activeArticles.filter((a) => a.tagPaths.includes(item.path)).length }} 篇文章</small>
          <button type="button" @click="editTag(item)">编辑</button><button type="button" @click="deleteTag(item.id)"><MoreHorizontal :size="20" /></button>
        </article>
        <footer>共 {{ data.tags.length }} 项数据</footer>
      </section>

      <section v-if="active === 'pages'" class="halo-card table-card">
        <div class="table-toolbar"><input type="checkbox"><label><Search :size="18" /><input placeholder="输入关键词搜索"></label><div class="filters"><span>状态：全部 <ChevronDown :size="16" /></span><RefreshCcw :size="18" /></div></div>
        <article v-for="item in activePages" :key="item.id" class="halo-row">
          <input type="checkbox"><div><strong>{{ item.title }}</strong><p>访问量 {{ item.views || 0 }}　评论 {{ pageComments(item.id) }}</p></div>
          <em>A</em><small>已发布</small><button type="button" @click="editPage(item)">编辑</button><button type="button" @click="deletePage(item.id)"><Trash2 :size="17" /></button>
        </article>
        <footer>共 {{ activePages.length }} 项数据</footer>
      </section>

      <section v-if="active === 'trash'" class="halo-card table-card">
        <div class="table-toolbar">
          <strong>已删除内容</strong>
          <div class="filters"><span>文章 {{ trashedArticles.length }}</span><span>页面 {{ trashedPages.length }}</span><RefreshCcw :size="18" /></div>
        </div>
        <article v-for="item in trashedArticles" :key="item.id" class="halo-row">
          <div><strong>{{ item.title }}</strong><p>文章　删除于 {{ item.deletedAt ? new Date(item.deletedAt).toLocaleString('zh-CN') : '-' }}</p></div>
          <button type="button" @click="restoreTrash('article', item.id)">恢复</button>
          <button type="button" @click="purgeTrash('article', item.id)">永久删除</button>
        </article>
        <article v-for="item in trashedPages" :key="item.id" class="halo-row">
          <div><strong>{{ item.title }}</strong><p>页面　删除于 {{ item.deletedAt ? new Date(item.deletedAt).toLocaleString('zh-CN') : '-' }}</p></div>
          <button type="button" @click="restoreTrash('page', item.id)">恢复</button>
          <button type="button" @click="purgeTrash('page', item.id)">永久删除</button>
        </article>
        <footer>共 {{ trashedArticles.length + trashedPages.length }} 项数据</footer>
      </section>

      <section v-if="active === 'page-editor'" class="editor-shell">
        <div class="editor-toolbar"><button @click="active = 'pages'">返回</button><button class="halo-dark-btn" @click="savePage">发布</button></div>
        <input v-model="pageForm.title" class="editor-title" placeholder="请输入标题">
        <div class="editor-grid"><ClientOnly><EditorMd v-model="pageForm.content" placeholder="输入 Markdown，支持直接混用 HTML" allow-html :height="620" /></ClientOnly><aside class="editor-aside"><label>路径<input v-model="pageForm.path"></label></aside></div>
      </section>

      <section v-if="active === 'comments'" class="halo-card table-card">
        <article v-for="item in data.comments" :key="item.id" class="halo-row">
          <div><strong>{{ item.authorName }}</strong><div class="admin-comment-md" v-html="markdownPreview(item.content)" /><small>{{ new Date(item.createdAt).toLocaleString('zh-CN') }}</small></div>
          <small>{{ item.targetType }}</small><button type="button" @click="deleteComment(item.id)"><Trash2 :size="17" /></button>
        </article>
        <footer>共 {{ data.comments.length }} 项数据</footer>
      </section>

      <section v-if="active === 'nav'" class="menu-grid">
        <div class="halo-card menu-side"><h2>菜单</h2><article><strong>主菜单</strong><span>{{ data.navItems.length }} 个菜单项</span></article><button class="halo-dark-btn" @click="editNav()">新建</button></div>
        <div class="halo-card table-card"><div class="card-head"><h2>主菜单</h2><button @click="editNav()">新建</button></div><article v-for="item in data.navItems" :key="item.id" class="halo-row"><div><strong>{{ item.label }}</strong><p>{{ item.href }}</p></div><button @click="editNav(item)">编辑</button><button @click="deleteNav(item.id)"><MoreHorizontal :size="20" /></button></article></div>
      </section>

      <section v-if="active === 'users'" class="halo-card table-card">
        <article v-for="item in data.users" :key="item.id" class="halo-row"><div><strong>{{ item.displayName }}</strong><p>@{{ item.username }}</p></div><small>{{ item.role }}</small></article>
      </section>

      <section v-if="active === 'settings'" class="halo-card settings-card">
        <label>站点标题<input v-model="settingsForm.title"></label>
        <label>副标题<input v-model="settingsForm.subtitle"></label>
        <label>站点背景图片 URL<input v-model="settingsForm.backgroundImage"></label>
        <label>首页 Site Hero 背景 URL<input v-model="settingsForm.heroBackgroundImage" placeholder="留空则使用站点背景"></label>
        <label>背景遮罩 {{ settingsForm.backgroundOverlay }}<input v-model.number="settingsForm.backgroundOverlay" type="range" min="0" max="0.95" step="0.01"></label>
        <label>卡片/导航透明度 {{ settingsForm.glassOpacity }}<input v-model.number="settingsForm.glassOpacity" type="range" min="0.25" max="1" step="0.01"></label>
        <button class="halo-dark-btn" :disabled="saving" @click="saveSettings"><Save :size="18" /> 保存</button>
      </section>

      <section v-if="['assets','overview','tools'].includes(active)" class="halo-card empty-admin">功能入口已保留，可以继续扩展。</section>
    </main>

    <div v-if="showCategoryModal || showTagModal || showNavModal" class="halo-modal">
      <form v-if="showCategoryModal" class="halo-dialog" @submit.prevent="saveCategory">
        <h2>新增文章分类</h2><label>名称 *<input v-model="categoryForm.name" autofocus></label><label>别名 *<input v-model="categoryForm.path"></label><label>描述<textarea v-model="categoryForm.description"></textarea></label>
        <footer><button class="halo-dark-btn">提交（⌘ + ↵）</button><button type="button" @click="showCategoryModal = false">取消（Esc）</button></footer>
      </form>
      <form v-if="showTagModal" class="halo-dialog" @submit.prevent="saveTag">
        <h2>新增文章标签</h2><label>名称 *<input v-model="tagForm.name" autofocus></label><label>别名 *<input v-model="tagForm.path"></label><label>描述<textarea v-model="tagForm.description"></textarea></label>
        <footer><button class="halo-dark-btn">提交（⌘ + ↵）</button><button type="button" @click="showTagModal = false">取消（Esc）</button></footer>
      </form>
      <form v-if="showNavModal" class="halo-dialog" @submit.prevent="saveNav">
        <h2>新增菜单项</h2><label>名称 *<input v-model="navForm.label" autofocus></label><label>链接地址 *<input v-model="navForm.href"></label><label>排序<input v-model.number="navForm.sort" type="number"></label>
        <footer><button class="halo-dark-btn">提交（⌘ + ↵）</button><button type="button" @click="showNavModal = false">取消（Esc）</button></footer>
      </form>
    </div>
  </div>
</template>
