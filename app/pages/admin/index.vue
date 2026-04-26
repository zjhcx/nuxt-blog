<script setup lang="ts">
import { FileText, FolderOpen, Image, Link, Navigation, Plus, Save, Tag, Trash2 } from 'lucide-vue-next'
import type { BlogArticle, BlogCategory, BlogData, BlogNavItem, BlogPage, BlogSettings, BlogTag } from '~/types/blog'

const tabs = [
  { id: 'articles', label: '文章', icon: FileText },
  { id: 'categories', label: '分类', icon: FolderOpen },
  { id: 'tags', label: '标签', icon: Tag },
  { id: 'nav', label: '导航', icon: Navigation },
  { id: 'pages', label: '页面', icon: Link },
  { id: 'settings', label: '外观', icon: Image }
]

const active = ref('articles')
const saving = ref(false)
const { data, refresh } = await useFetch<BlogData>('/api/admin/all')

const emptyArticle = (): Partial<BlogArticle> => ({ status: 'published', title: '', path: '', excerpt: '', content: '', cover: '', categoryPath: '', tagPaths: [] })
const emptyCategory = (): Partial<BlogCategory> => ({ name: '', path: '', description: '' })
const emptyTag = (): Partial<BlogTag> => ({ name: '', path: '', description: '' })
const emptyNav = (): Partial<BlogNavItem> => ({ label: '', href: '/', sort: (data.value?.navItems.length || 0) + 1, visible: true })
const emptyPage = (): Partial<BlogPage> => ({ title: '', path: '', content: '' })

const articleForm = ref<Partial<BlogArticle>>(emptyArticle())
const categoryForm = ref<Partial<BlogCategory>>(emptyCategory())
const tagForm = ref<Partial<BlogTag>>(emptyTag())
const navForm = ref<Partial<BlogNavItem>>(emptyNav())
const pageForm = ref<Partial<BlogPage>>(emptyPage())
const settingsForm = ref<BlogSettings>({
  title: data.value?.settings.title || 'Nuxt Blog',
  subtitle: data.value?.settings.subtitle || '',
  backgroundImage: data.value?.settings.backgroundImage || '',
  backgroundOverlay: data.value?.settings.backgroundOverlay ?? 0.54,
  glassOpacity: data.value?.settings.glassOpacity ?? 0.68
})

watch(data, (value) => {
  if (value) settingsForm.value = { ...value.settings }
}, { immediate: true })

const run = async (fn: () => Promise<unknown>) => {
  saving.value = true
  try {
    await fn()
    await refresh()
  } finally {
    saving.value = false
  }
}

const saveArticle = () => run(async () => {
  await $fetch('/api/admin/articles', { method: 'POST', body: articleForm.value })
  articleForm.value = emptyArticle()
})
const editArticle = (item: BlogArticle) => { articleForm.value = { ...item, tagPaths: [...item.tagPaths] }; active.value = 'articles' }
const deleteArticle = (id: string) => run(() => $fetch(`/api/admin/articles/${id}`, { method: 'DELETE' }))

const saveCategory = () => run(async () => {
  await $fetch('/api/admin/categories', { method: 'POST', body: categoryForm.value })
  categoryForm.value = emptyCategory()
})
const editCategory = (item: BlogCategory) => { categoryForm.value = { ...item }; active.value = 'categories' }
const deleteCategory = (id: string) => run(() => $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }))

const saveTag = () => run(async () => {
  await $fetch('/api/admin/tags', { method: 'POST', body: tagForm.value })
  tagForm.value = emptyTag()
})
const editTag = (item: BlogTag) => { tagForm.value = { ...item }; active.value = 'tags' }
const deleteTag = (id: string) => run(() => $fetch(`/api/admin/tags/${id}`, { method: 'DELETE' }))

const saveNav = () => run(async () => {
  await $fetch('/api/admin/nav', { method: 'POST', body: navForm.value })
  navForm.value = emptyNav()
})
const editNav = (item: BlogNavItem) => { navForm.value = { ...item }; active.value = 'nav' }
const deleteNav = (id: string) => run(() => $fetch(`/api/admin/nav/${id}`, { method: 'DELETE' }))

const savePage = () => run(async () => {
  await $fetch('/api/admin/pages', { method: 'POST', body: pageForm.value })
  pageForm.value = emptyPage()
})
const editPage = (item: BlogPage) => { pageForm.value = { ...item }; active.value = 'pages' }
const deletePage = (id: string) => run(() => $fetch(`/api/admin/pages/${id}`, { method: 'DELETE' }))

const saveSettings = () => run(async () => {
  await $fetch('/api/admin/settings', { method: 'PUT', body: settingsForm.value })
  useBlogSettings().value = { ...settingsForm.value }
})
</script>

<template>
  <section class="container hero">
    <h1>管理后台</h1>
    <p>管理真实内容、导航、分类标签、自定义页面和站点背景。</p>
  </section>

  <section class="container admin-layout">
    <aside class="admin-tabs">
      <button v-for="tab in tabs" :key="tab.id" class="btn" :class="{ primary: active === tab.id }" type="button" @click="active = tab.id">
        <component :is="tab.icon" :size="17" /> {{ tab.label }}
      </button>
    </aside>

    <div v-if="data" class="stack">
      <div v-if="active === 'articles'" class="panel glass stack">
        <h2 class="section-title">文章创建/修改</h2>
        <div class="form-grid">
          <label class="field"><span>标题</span><input v-model="articleForm.title" class="input"></label>
          <label class="field"><span>路径</span><input v-model="articleForm.path" class="input" placeholder="留空自动生成"></label>
          <label class="field"><span>封面 URL</span><input v-model="articleForm.cover" class="input"></label>
          <label class="field"><span>状态</span><select v-model="articleForm.status" class="select"><option value="published">发布</option><option value="draft">草稿</option></select></label>
          <label class="field"><span>分类</span><select v-model="articleForm.categoryPath" class="select"><option value="">无分类</option><option v-for="c in data.categories" :key="c.id" :value="c.path">{{ c.name }}</option></select></label>
          <label class="field"><span>标签</span><select v-model="articleForm.tagPaths" class="select" multiple><option v-for="t in data.tags" :key="t.id" :value="t.path">{{ t.name }}</option></select></label>
          <label class="field full"><span>摘要</span><textarea v-model="articleForm.excerpt" class="textarea" style="min-height:90px;" /></label>
          <label class="field full"><span>正文</span><textarea v-model="articleForm.content" class="textarea" /></label>
        </div>
        <div class="tags">
          <button class="btn primary" type="button" :disabled="saving" @click="saveArticle"><Save :size="17" /> 保存文章</button>
          <button class="btn" type="button" @click="articleForm = emptyArticle()"><Plus :size="17" /> 新建</button>
        </div>
      </div>

      <div v-if="active === 'articles'" class="table-list">
        <div v-for="item in data.articles" :key="item.id" class="row-item">
          <button class="btn" type="button" @click="editArticle(item)">{{ item.title }} · {{ item.status }}</button>
          <button class="icon-button" type="button" title="删除" @click="deleteArticle(item.id)"><Trash2 :size="17" /></button>
        </div>
      </div>

      <div v-if="active === 'categories'" class="panel glass stack">
        <h2 class="section-title">分类</h2>
        <div class="form-grid">
          <label class="field"><span>名称</span><input v-model="categoryForm.name" class="input"></label>
          <label class="field"><span>路径</span><input v-model="categoryForm.path" class="input" placeholder="留空自动生成"></label>
          <label class="field full"><span>描述</span><textarea v-model="categoryForm.description" class="textarea" /></label>
        </div>
        <button class="btn primary" type="button" @click="saveCategory"><Save :size="17" /> 保存分类</button>
        <div class="table-list">
          <div v-for="item in data.categories" :key="item.id" class="row-item"><button class="btn" @click="editCategory(item)">{{ item.name }}</button><button class="icon-button" @click="deleteCategory(item.id)"><Trash2 :size="17" /></button></div>
        </div>
      </div>

      <div v-if="active === 'tags'" class="panel glass stack">
        <h2 class="section-title">标签</h2>
        <div class="form-grid">
          <label class="field"><span>名称</span><input v-model="tagForm.name" class="input"></label>
          <label class="field"><span>路径</span><input v-model="tagForm.path" class="input" placeholder="留空自动生成"></label>
          <label class="field full"><span>描述</span><textarea v-model="tagForm.description" class="textarea" /></label>
        </div>
        <button class="btn primary" type="button" @click="saveTag"><Save :size="17" /> 保存标签</button>
        <div class="table-list">
          <div v-for="item in data.tags" :key="item.id" class="row-item"><button class="btn" @click="editTag(item)">{{ item.name }}</button><button class="icon-button" @click="deleteTag(item.id)"><Trash2 :size="17" /></button></div>
        </div>
      </div>

      <div v-if="active === 'nav'" class="panel glass stack">
        <h2 class="section-title">导航条目</h2>
        <div class="form-grid">
          <label class="field"><span>名称</span><input v-model="navForm.label" class="input"></label>
          <label class="field"><span>链接</span><input v-model="navForm.href" class="input"></label>
          <label class="field"><span>排序</span><input v-model.number="navForm.sort" class="input" type="number"></label>
          <label class="field"><span>显示</span><select v-model="navForm.visible" class="select"><option :value="true">显示</option><option :value="false">隐藏</option></select></label>
        </div>
        <button class="btn primary" type="button" @click="saveNav"><Save :size="17" /> 保存导航</button>
        <div class="table-list">
          <div v-for="item in data.navItems" :key="item.id" class="row-item"><button class="btn" @click="editNav(item)">{{ item.label }} · {{ item.href }}</button><button class="icon-button" @click="deleteNav(item.id)"><Trash2 :size="17" /></button></div>
        </div>
      </div>

      <div v-if="active === 'pages'" class="panel glass stack">
        <h2 class="section-title">自定义页面</h2>
        <div class="form-grid">
          <label class="field"><span>标题</span><input v-model="pageForm.title" class="input"></label>
          <label class="field"><span>路径</span><input v-model="pageForm.path" class="input" placeholder="about / links"></label>
          <label class="field full"><span>内容</span><textarea v-model="pageForm.content" class="textarea" /></label>
        </div>
        <button class="btn primary" type="button" @click="savePage"><Save :size="17" /> 保存页面</button>
        <div class="table-list">
          <div v-for="item in data.pages" :key="item.id" class="row-item"><button class="btn" @click="editPage(item)">{{ item.title }} · /a/{{ item.path }}</button><button class="icon-button" @click="deletePage(item.id)"><Trash2 :size="17" /></button></div>
        </div>
      </div>

      <div v-if="active === 'settings'" class="panel glass stack">
        <h2 class="section-title">背景与透明度</h2>
        <div class="form-grid">
          <label class="field"><span>站点标题</span><input v-model="settingsForm.title" class="input"></label>
          <label class="field"><span>副标题</span><input v-model="settingsForm.subtitle" class="input"></label>
          <label class="field full"><span>背景图片 URL</span><input v-model="settingsForm.backgroundImage" class="input"></label>
          <label class="field"><span>背景遮罩 {{ settingsForm.backgroundOverlay }}</span><input v-model.number="settingsForm.backgroundOverlay" type="range" min="0" max="0.95" step="0.01"></label>
          <label class="field"><span>卡片/导航透明度 {{ settingsForm.glassOpacity }}</span><input v-model.number="settingsForm.glassOpacity" type="range" min="0.25" max="1" step="0.01"></label>
        </div>
        <button class="btn primary" type="button" @click="saveSettings"><Save :size="17" /> 保存外观</button>
      </div>
    </div>
  </section>
</template>
